use crate::store::{Chapter, Library, Manhwa};
use base64::{engine::general_purpose, Engine as _};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

pub struct AppState {
    pub library: Mutex<Library>,
}

#[tauri::command]
pub fn get_library(state: State<AppState>) -> Vec<Manhwa> {
    let library = state.library.lock().unwrap();
    library.manhwas.clone()
}

#[tauri::command]
pub fn import_manhwa(path: String, state: State<AppState>) -> Result<Manhwa, String> {
    let folder = std::path::Path::new(&path);
    if !folder.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let name = folder
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let mut entries: Vec<_> = std::fs::read_dir(folder)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path()
                .extension()
                .map(|ext| ext.to_ascii_lowercase() == "pdf")
                .unwrap_or(false)
        })
        .collect();

    entries.sort_by_key(|e| e.file_name());

    let chapters: Vec<Chapter> = entries
        .iter()
        .map(|entry| {
            let file_name = entry.file_name().to_string_lossy().to_string();
            let stem = entry
                .path()
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();
            let (number, chapter_name) = parse_chapter_name(&stem);
            Chapter {
                number,
                name: chapter_name,
                file_name,
                read: false,
            }
        })
        .collect();

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let manhwa = Manhwa {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        path,
        chapters,
        added_at: timestamp.to_string(),
    };

    let mut library = state.library.lock().unwrap();
    library.manhwas.push(manhwa.clone());
    library.save();

    Ok(manhwa)
}

#[tauri::command]
pub fn delete_manhwa(id: String, state: State<AppState>) -> Result<(), String> {
    let mut library = state.library.lock().unwrap();
    let len_before = library.manhwas.len();
    library.manhwas.retain(|m| m.id != id);
    if library.manhwas.len() == len_before {
        return Err("Manhwa not found".to_string());
    }
    library.save();
    Ok(())
}

#[tauri::command]
pub fn update_manhwa_name(id: String, name: String, state: State<AppState>) -> Result<(), String> {
    let mut library = state.library.lock().unwrap();
    let manhwa = library
        .manhwas
        .iter_mut()
        .find(|m| m.id == id)
        .ok_or("Manhwa not found")?;
    manhwa.name = name;
    library.save();
    Ok(())
}

#[tauri::command]
pub fn mark_chapter_read(
    manhwa_id: String,
    chapter_idx: usize,
    read: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let mut library = state.library.lock().unwrap();
    let manhwa = library
        .manhwas
        .iter_mut()
        .find(|m| m.id == manhwa_id)
        .ok_or("Manhwa not found")?;
    let chapter = manhwa
        .chapters
        .get_mut(chapter_idx)
        .ok_or("Chapter not found")?;
    chapter.read = read;
    library.save();
    Ok(())
}

#[tauri::command]
pub fn mark_chapters_read(
    manhwa_id: String,
    chapter_indices: Vec<usize>,
    read: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let mut library = state.library.lock().unwrap();
    let manhwa = library
        .manhwas
        .iter_mut()
        .find(|m| m.id == manhwa_id)
        .ok_or("Manhwa not found")?;
    for idx in chapter_indices {
        if let Some(chapter) = manhwa.chapters.get_mut(idx) {
            chapter.read = read;
        }
    }
    library.save();
    Ok(())
}

#[tauri::command]
pub fn get_chapter_pdf(
    manhwa_id: String,
    chapter_idx: usize,
    state: State<AppState>,
) -> Result<String, String> {
    let library = state.library.lock().unwrap();
    let manhwa = library
        .manhwas
        .iter()
        .find(|m| m.id == manhwa_id)
        .ok_or("Manhwa not found")?;
    let chapter = manhwa
        .chapters
        .get(chapter_idx)
        .ok_or("Chapter not found")?;
    let pdf_path = std::path::Path::new(&manhwa.path).join(&chapter.file_name);
    let data = std::fs::read(&pdf_path).map_err(|e| e.to_string())?;
    Ok(general_purpose::STANDARD.encode(&data))
}

fn parse_chapter_name(stem: &str) -> (u32, String) {
    if let Some(idx) = stem.find(" - ") {
        let num_str = &stem[..idx];
        if let Ok(num) = num_str.trim().parse::<u32>() {
            let name = stem[idx + 3..].to_string();
            return (num, name);
        }
    }

    if let Ok(num) = stem.trim().parse::<u32>() {
        return (num, format!("Chapter {}", num));
    }

    (0, stem.to_string())
}
