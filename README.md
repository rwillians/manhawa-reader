# Manhawa Reader

A minimalistic macOS desktop app for reading manhawas (Korean comics) stored as PDF chapters on your local filesystem.

## Prerequisites

- [asdf](https://asdf-vm.com/) version manager
- Bun and Rust are managed via `.tool-versions`

## Setup

```sh
# Install Bun + Rust via asdf
asdf install

# Install workspace JS deps and pre-fetch Rust crates
bun run setup

# Start the app in development mode
bun run dev
```

## Build

```sh
bun run build
```

Produces `dist/Manhawa Reader.dmg`. The unpacked `.app` and intermediate
artifacts stay under `apps/backend/target/release/bundle/`.

## Layout

This is a bun-workspace monorepo:

| Path             | Contents                            |
| :--------------- | :---------------------------------- |
| `apps/frontend/` | React + Vite + TypeScript UI        |
| `apps/backend/`  | Tauri/Rust desktop shell            |
| `./`             | Workspace orchestration (dev/build) |

## Features

- **Import** a manhawa by selecting its folder (PDF files named `001.pdf` or `001 - Chapter Name.pdf`)
- **Browse** your collection with reading progress (donut chart)
- **Continue reading** from where you left off
- **Read** chapters in a distraction-free vertical scroll viewer with auto-hiding navigation
- **Mark chapters** as read/unread individually or in bulk (shift+click, cmd+click)
- **Settings** per manhawa: rename, reset progress, remove from collection
- **Read again** resets progress and starts from the first chapter

## Data

Your library data is stored at `~/Documents/Manhawa Reader/.data/library.json`. Removing a manhawa from the collection only deletes reading progress — your files are never touched.
