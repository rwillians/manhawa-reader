use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    pub number: u32,
    pub name: String,
    pub file_name: String,
    pub read: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Manhwa {
    pub id: String,
    pub name: String,
    pub path: String,
    pub chapters: Vec<Chapter>,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Library {
    pub manhwas: Vec<Manhwa>,
}

impl Library {
    pub fn load() -> Self {
        let path = Self::data_path();
        if path.exists() {
            let data = fs::read_to_string(&path).unwrap_or_default();
            serde_json::from_str(&data).unwrap_or(Library { manhwas: vec![] })
        } else {
            Library { manhwas: vec![] }
        }
    }

    pub fn save(&self) {
        let path = Self::data_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).ok();
        }
        let data = serde_json::to_string_pretty(self).unwrap();
        fs::write(path, data).ok();
    }

    fn data_path() -> PathBuf {
        let home = dirs::home_dir().expect("Could not find home directory");
        home.join("Documents")
            .join("Manhawa Reader")
            .join(".data")
            .join("library.json")
    }
}
