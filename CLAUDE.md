# Manhawa Reader

## Stack

- **Tauri v2** - desktop app framework (Rust backend + web frontend)
- **React 19 + TypeScript** - frontend UI
- **Vite 6** - build toolchain
- **Bun** - JavaScript runtime and package manager (managed via asdf)
- **Rust** - backend language (managed via asdf)
- **pdfjs-dist** - PDF rendering in the webview

## Project Structure

This repo is a bun-workspace monorepo. Root `package.json` orchestrates;
the React app lives in `apps/frontend/`, the Tauri shell in `apps/backend/`.

| Path                                       | Purpose                                    |
| :----------------------------------------- | :----------------------------------------- |
| `apps/frontend/src/`                       | React frontend                             |
| `apps/frontend/src/views/Library.tsx`      | Collection grid with import                |
| `apps/frontend/src/views/ManhwaDetail.tsx` | Detail view, chapters, settings, selection |
| `apps/frontend/src/views/Reader.tsx`       | Full-screen PDF reader                     |
| `apps/frontend/src/api.ts`                 | Frontend wrappers for Tauri IPC commands   |
| `apps/frontend/src/types.ts`               | Shared TypeScript types                    |
| `apps/frontend/package.json`               | Frontend deps + vite scripts               |
| `apps/backend/`                            | Rust backend (Tauri)                       |
| `apps/backend/src/commands.rs`             | Tauri IPC command handlers                 |
| `apps/backend/src/store.rs`                | Data models + JSON persistence             |
| `apps/backend/src/lib.rs`                  | App builder, plugin/command registration   |
| `apps/backend/tauri.conf.json`             | Tauri app config (window, bundle, plugins) |
| `apps/backend/capabilities/`               | Permission scoping for Tauri plugins       |
| `package.json`                             | Workspace root + `dev`/`build` scripts     |

## Data Storage

Library data: `~/Documents/Manhawa Reader/.data/library.json`

## Development

```sh
asdf install   # install bun + rust via .tool-versions
bun install    # install workspace deps (root + frontend)
bun run dev    # start dev server with hot reload
bun run build  # production build (.app + .dmg)
```

Build output: `apps/backend/target/release/bundle/macos/` and `bundle/dmg/`

Both `dev` and `build` invoke the Tauri CLI with `-c apps/backend/tauri.conf.json`.
Tauri's `beforeDevCommand`/`beforeBuildCommand` use bun's workspace filter
(`bun run --filter @manhawa-reader/frontend …`) so they don't depend on the
process cwd.

## Architecture Decisions

- **State-based routing** in React (no router library) — views are `library`, `detail`, `reader`
- **PDF data** is read in Rust and transferred as base64 to the frontend via IPC
- **Chapter filename parsing**: `NNN - Name.pdf` or `NNN.pdf` (sort-safe naming assumed)
- **Confirmation dialogs** are in-app (not native `confirm()`) for dangerous actions (delete, reset progress)
- **Multi-select** on chapter list: click, shift+click (range), cmd+click (toggle) with bulk action bar
- **Bundle identifier**: `com.manhawa-reader.desktop` (not `.app` — conflicts with macOS bundle extension)

## Tauri Commands (IPC)

| Command                | Description                        |
| :--------------------- | :--------------------------------- |
| `get_library`          | Return all manhwas                 |
| `import_manhwa`        | Scan folder, create manhwa entry   |
| `delete_manhwa`        | Remove manhwa from collection      |
| `update_manhwa_name`   | Rename a manhwa                    |
| `mark_chapter_read`    | Toggle single chapter read status  |
| `mark_chapters_read`   | Bulk toggle chapter read status    |
| `get_chapter_pdf`      | Return PDF bytes as base64         |

## User Preferences

1. Be proactive about committing changes.
