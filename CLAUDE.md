# Manhawa Reader

## Stack

- **Tauri v2** - desktop app framework (Rust backend + web frontend)
- **React 19 + TypeScript** - frontend UI
- **Vite 6** - build toolchain
- **Bun** - JavaScript runtime and package manager (managed via asdf)
- **Rust** - backend language (managed via asdf)
- **pdfjs-dist** - PDF rendering in the webview

## Project Structure

| Path                            | Purpose                                    |
| :------------------------------ | :----------------------------------------- |
| `src/`                          | React frontend                             |
| `src/views/Library.tsx`         | Collection grid with import                |
| `src/views/ManhwaDetail.tsx`    | Detail view, chapters, settings, selection |
| `src/views/Reader.tsx`          | Full-screen PDF reader                     |
| `src/api.ts`                    | Frontend wrappers for Tauri IPC commands   |
| `src/types.ts`                  | Shared TypeScript types                    |
| `src-tauri/`                    | Rust backend (Tauri)                       |
| `src-tauri/src/commands.rs`     | Tauri IPC command handlers                 |
| `src-tauri/src/store.rs`        | Data models + JSON persistence             |
| `src-tauri/src/lib.rs`          | App builder, plugin/command registration   |
| `src-tauri/tauri.conf.json`     | Tauri app config (window, bundle, plugins) |
| `src-tauri/capabilities/`       | Permission scoping for Tauri plugins       |

## Data Storage

Library data: `~/Documents/Manhawa Reader/.data/library.json`

## Development

```sh
asdf install       # install bun + rust via .tool-versions
bun install        # install frontend dependencies
bun run tauri dev  # start dev server with hot reload
bun run tauri build # production build (.app + .dmg)
```

Build output: `src-tauri/target/release/bundle/macos/` and `bundle/dmg/`

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
