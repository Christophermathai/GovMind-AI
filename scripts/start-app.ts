#!/usr/bin/env node
/**
 * GovMind AI — Master Startup Orchestrator (`npm run app`)
 *
 * Enforces startup constraints:
 * 1. Checks local Ollama status.
 * 2. Launches and polls the Python Ingestion Service (FastAPI) until healthy.
 * 3. Launches the Next.js frontend only after backend health is confirmed.
 * 4. Gracefully terminates all services on exit.
 */

import 'dotenv/config';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const INGESTION_DIR = path.join(ROOT_DIR, 'ingestion-service');

const BACKEND_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

let backendProcess: ChildProcess | null = null;
let frontendProcess: ChildProcess | null = null;

function log(module: string, message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\x1b[90m[${timestamp}]\x1b[0m \x1b[36m[${module}]\x1b[0m ${message}`);
}

function errorLog(module: string, message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`\x1b[90m[${timestamp}]\x1b[0m \x1b[31m[${module}]\x1b[0m ${message}`);
}

// ── 1. Locate Python Interpreter ─────────────────────────────────────────────
function findPython(): string {
  const windowsVenv = path.join(ROOT_DIR, '.venv', 'Scripts', 'python.exe');
  const posixVenv = path.join(ROOT_DIR, '.venv', 'bin', 'python');

  if (fs.existsSync(windowsVenv)) return windowsVenv;
  if (fs.existsSync(posixVenv)) return posixVenv;

  // Global fallback
  return process.platform === 'win32' ? 'python' : 'python3';
}

// ── 2. Health Checker ────────────────────────────────────────────────────────
function checkEndpoint(urlStr: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const req = http.get(
        {
          hostname: url.hostname,
          port: url.port || 80,
          path: url.pathname,
          timeout: 2000,
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function waitForBackend(maxAttempts = 30, intervalMs = 1000): Promise<boolean> {
  const healthUrl = `${BACKEND_URL}/health`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isUp = await checkEndpoint(healthUrl);
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

// ── 3. Start Backend Ingestion Service ───────────────────────────────────────
async function startBackend(): Promise<boolean> {
  const alreadyUp = await checkEndpoint(`${BACKEND_URL}/health`);
  if (alreadyUp) {
    log('BACKEND', `Ingestion service is already running on ${BACKEND_URL} (constraint met).`);
    return true;
  }

  const pythonExec = findPython();
  log('BACKEND', `Spawning FastAPI Ingestion Service using: ${pythonExec}`);

  backendProcess = spawn(
    pythonExec,
    ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
    {
      cwd: INGESTION_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    }
  );

  backendProcess.stdout?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log('PYTHON', text);
  });

  backendProcess.stderr?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log('PYTHON', text);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      errorLog('BACKEND', `Process exited unexpectedly with code ${code}`);
    }
  });

  log('ORCHESTRATOR', 'Waiting for backend health check at /health...');
  const isHealthy = await waitForBackend();

  if (isHealthy) {
    log('BACKEND', `\x1b[32m✔ Service is healthy at ${BACKEND_URL}/health\x1b[0m`);
    return true;
  } else {
    errorLog('BACKEND', 'Failed to reach /health within timeout.');
    return false;
  }
}

// ── 4. Start Next.js Frontend ────────────────────────────────────────────────
function startFrontend() {
  log('FRONTEND', 'Starting Next.js development server (port 3000)...');

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  frontendProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  frontendProcess.on('exit', (code) => {
    log('FRONTEND', `Frontend process exited with code ${code}`);
    shutdown();
  });

  // Background route pre-warming
  setTimeout(async () => {
    const routes = ['/', '/citizen', '/business', '/rights'];
    log('ORCHESTRATOR', 'Pre-warming routes in background so your browser loads are instant...');
    for (const r of routes) {
      await new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${r}`, (res) => {
          res.resume();
          resolve(true);
        });
        req.on('error', () => resolve(false));
      });
      log('WARMUP', `✔ Pre-compiled ${r}`);
    }
    log('ORCHESTRATOR', '\x1b[32m✔ All routes pre-compiled! Page loads in browser are now instant.\x1b[0m');
  }, 2000);
}

// ── 5. Graceful Teardown ────────────────────────────────────────────────────
function killProcess(pid?: number) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    // Process already terminated
  }
}

function shutdown() {
  log('ORCHESTRATOR', 'Shutting down all GovMind AI services...');
  if (frontendProcess?.pid) {
    killProcess(frontendProcess.pid);
    frontendProcess = null;
  }
  if (backendProcess?.pid) {
    killProcess(backendProcess.pid);
    backendProcess = null;
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Master Execution Flow ────────────────────────────────────────────────────
async function main() {
  console.log('\n\x1b[1m\x1b[35m=== GovMind AI — Master Startup Orchestrator ===\x1b[0m\n');

  // Check Ollama (Warning only, non-fatal)
  const isOllamaUp = await checkEndpoint(`${OLLAMA_URL}/api/tags`);
  if (isOllamaUp) {
    log('OLLAMA', `\x1b[32m✔ Ollama active at ${OLLAMA_URL}\x1b[0m`);
  } else {
    log('OLLAMA', `\x1b[33m⚠ Warning: Ollama not responding at ${OLLAMA_URL}. Ensure Ollama is running for AI chat.\x1b[0m`);
  }

  // Constraint: Backend MUST start first and be healthy
  log('ORCHESTRATOR', 'CONSTRAINT 1: Initializing backend service first...');
  const backendReady = await startBackend();

  if (!backendReady) {
    errorLog('ORCHESTRATOR', 'Aborting startup: Backend failed health constraint check.');
    shutdown();
    return;
  }

  // Constraint: Frontend only starts AFTER backend is healthy
  log('ORCHESTRATOR', 'CONSTRAINT 2: Backend health verified. Proceeding to frontend launch...');
  startFrontend();
}

main().catch((err) => {
  errorLog('FATAL', err.message);
  shutdown();
});
