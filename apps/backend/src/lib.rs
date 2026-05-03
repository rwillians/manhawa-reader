mod commands;
mod store;

use commands::AppState;
use store::Library;
use std::sync::Mutex;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            library: Mutex::new(Library::load()),
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_library,
            commands::import_manhwa,
            commands::delete_manhwa,
            commands::update_manhwa_name,
            commands::mark_chapter_read,
            commands::mark_chapters_read,
            commands::get_chapter_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
