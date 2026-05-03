import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { Manhwa } from "./types";

export async function getLibrary(): Promise<Manhwa[]> {
  return invoke("get_library");
}

export async function importManhwa(): Promise<Manhwa | null> {
  const path = await open({ directory: true, multiple: false });
  if (!path) return null;
  return invoke("import_manhwa", { path });
}

export async function deleteManhwa(id: string): Promise<void> {
  return invoke("delete_manhwa", { id });
}

export async function updateManhwaName(
  id: string,
  name: string,
): Promise<void> {
  return invoke("update_manhwa_name", { id, name });
}

export async function markChapterRead(
  manhwaId: string,
  chapterIdx: number,
  read: boolean,
): Promise<void> {
  return invoke("mark_chapter_read", { manhwaId, chapterIdx, read });
}

export async function markChaptersRead(
  manhwaId: string,
  chapterIndices: number[],
  read: boolean,
): Promise<void> {
  return invoke("mark_chapters_read", { manhwaId, chapterIndices, read });
}

export async function getChapterPdf(
  manhwaId: string,
  chapterIdx: number,
): Promise<Uint8Array> {
  const base64: string = await invoke("get_chapter_pdf", {
    manhwaId,
    chapterIdx,
  });
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
