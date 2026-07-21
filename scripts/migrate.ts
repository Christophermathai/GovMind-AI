#!/usr/bin/env node
/**
 * GovMind AI — Supabase Migration Runner
 *
 * Runs all SQL files in supabase/migrations/ against your hosted Supabase
 * PostgreSQL database in filename order.
 *
 * Usage:
 *   npm run migrate              # run all pending migrations
 *   npm run migrate -- --dry-run # print SQL without executing
 *
 * Requirements:
 *   - .env must contain db_password and NEXT_PUBLIC_SUPABASE_URL
 *   - Supabase project must have the Direct Connection port open (5432)
 */

import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Extract project ref from the Supabase URL
// e.g. https://tvbwgetwsknhjzkhkazm.supabase.co → tvbwgetwsknhjzkhkazm
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const dbPassword = process.env.db_password ?? process.env.DB_PASSWORD ?? '';

if (!projectRef) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL is missing or malformed in .env');
  process.exit(1);
}
if (!dbPassword) {
  console.error('❌  db_password (or DB_PASSWORD) is missing in .env');
  process.exit(1);
}

// Build the connection string.
//
// Option 1 (recommended): Set DATABASE_URL in .env — copy it directly from
//   Supabase Dashboard → Project Settings → Database → Connection string → URI
//   Use the "Session pooler" string (port 6543) for best compatibility.
//
// Option 2 (auto-derived): If DATABASE_URL is not set, we construct the
//   Session Pooler URI from the project ref and db_password.
//   Session Pooler: host=aws-0-<region>.pooler.supabase.com, port=6543
//   username=postgres.<ref>
//
// The region defaults to ap-south-1 (Mumbai). If your project is in a
// different region, set DATABASE_URL explicitly or set SUPABASE_DB_REGION.

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

// ── Migration tracking table ─────────────────────────────────────────────────

const INIT_SQL = /* sql */ `
  CREATE TABLE IF NOT EXISTS _migrations (
    id          serial      PRIMARY KEY,
    filename    text        UNIQUE NOT NULL,
    applied_at  timestamptz NOT NULL DEFAULT now()
  );
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(msg);
}

function getMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌  Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // lexicographic sort ensures timestamp-prefix ordering
}

async function getAppliedMigrations(client: Client): Promise<Set<string>> {
  const { rows } = await client.query<{ filename: string }>(
    'SELECT filename FROM _migrations ORDER BY id',
  );
  return new Set(rows.map((r) => r.filename));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('\n🗄️  GovMind AI — Supabase Migration Runner');
  log(`   Project: ${projectRef}`);
  log(`   Migrations: ${MIGRATIONS_DIR}`);
  if (DRY_RUN) log('   Mode: DRY RUN (no SQL will be executed)\n');
  else log('');

  const files = getMigrationFiles();
  log(`📂  Found ${files.length} migration file(s):`);
  files.forEach((f) => log(`     ${f}`));
  log('');

  if (DRY_RUN) {
    log('📋  DRY RUN — SQL that would be executed:\n');
    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      log(`── ${file} ──`);
      log(sql);
    }
    log('✅  Dry run complete. No changes made.');
    return;
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    const displayUrl = connectionString.replace(/:([^@]+)@/, ':<redacted>@');
    log(`🔌  Connecting to: ${displayUrl}`);
    await client.connect().catch((err: Error) => {
      if (err.message.includes('tenant/user') || err.message.includes('ENOTFOUND') || err.message.includes('not found')) {
        console.error('\n❌  Connection failed — database host or region is incorrect.');
        console.error('\n   Fix: add DATABASE_URL to your .env file.');
        console.error('   Get it from: Supabase Dashboard → Project Settings → Database');
        console.error('               → Connection string → URI → Session pooler (port 6543)');
        console.error(`\n   Expected format:`);
        console.error(`   postgresql://postgres.${projectRef}:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`);
        process.exit(1);
      }
      throw err;
    });
    log('✅  Connected.\n');

    // Ensure migration tracking table exists
    await client.query(INIT_SQL);

    const applied = await getAppliedMigrations(client);
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      log('✅  All migrations already applied. Nothing to do.');
      return;
    }

    log(`⏳  Applying ${pending.length} pending migration(s)...\n`);

    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      process.stdout.write(`   → ${file} ... `);

      // Run each migration in its own transaction for atomicity
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [file],
        );
        await client.query('COMMIT');
        console.log('✅');
      } catch (err) {
        await client.query('ROLLBACK');
        console.log('❌  FAILED');
        console.error(`\n❌  Error in ${file}:\n`, err instanceof Error ? err.message : err);
        console.error('\n   Migration halted. Fix the error above and re-run.');
        process.exit(1);
      }
    }

    log(`\n🎉  ${pending.length} migration(s) applied successfully.`);

    // Summary of all applied migrations
    const allApplied = await getAppliedMigrations(client);
    log(`\n📊  Applied migrations (${allApplied.size} total):`);
    [...allApplied].forEach((f) => log(`     ✓ ${f}`));
  } finally {
    await client.end();
  }
}

main().catch((err: Error) => {
  if (err.message?.includes('tenant/user') || err.message?.includes('not found')) {
    console.error('\n❌  Connection failed — wrong database host or region.');
    console.error('   Add DATABASE_URL to .env — copy the Session Pooler URI from:');
    console.error('   Supabase Dashboard → Project Settings → Database → Connection string');
  } else {
    console.error('❌  Unexpected error:', err.message ?? err);
  }
  process.exit(1);
});
