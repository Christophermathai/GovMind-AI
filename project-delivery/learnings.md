# Project Learnings

## React / Next.js
- **JSX Syntax:** When utilizing command-line or terminal aesthetic strings directly within JSX nodes, always escape greater-than symbols (`>`) as `&gt;` (e.g., `SYS&gt;`) to avoid compiler parsing errors ("Unexpected token"). String literals within expression blocks (e.g., `{'SYS>'}`) are safe.
- **Next.js on Windows (@next/swc truncated download fix):** The error `... is not a valid Win32 application` when loading `next-swc.win32-x64-msvc.node` occurs when npm download terminates early, leaving a truncated binary (e.g. 18.5 MB instead of the full 136.8 MB). Windows PE loader rejects the truncated binary with `ERROR_BAD_EXE_FORMAT` (193). Purging `node_modules/@next/swc-win32-x64-msvc` and reinstalling `@next/swc-win32-x64-msvc@<version>` restores the full 136.8 MB binary, enabling full native Turbopack compilation without WASM fallback.
- **Lucide Icons in React 19 / Next.js Server Components:** In React 19, `createContext` is not available in Server Component runtimes. Because `lucide-react@1.x` instantiates an icon context, pages or components importing Lucide icons must include the `"use client";` directive at the top.
