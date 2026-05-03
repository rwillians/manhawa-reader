# Manhawa Reader

A minimalistic macOS desktop app for reading manhawas (Korean comics) stored as PDF chapters on your local filesystem.

## Prerequisites

- [asdf](https://asdf-vm.com/) version manager
- Bun and Rust are managed via `.tool-versions`

## Setup

```sh
# Install Bun + Rust via asdf
asdf install

# Install frontend dependencies
bun install

# Start the app in development mode
bun run tauri dev
```

## Build

```sh
bun run tauri build
```

Produces `Manhawa Reader.app` and a `.dmg` installer in `src-tauri/target/release/bundle/`.

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
