export type View =
  | { type: "library" }
  | { type: "detail"; manhwaId: string }
  | { type: "reader"; manhwaId: string; chapterIdx: number };

export interface Chapter {
  number: number;
  name: string;
  fileName: string;
  read: boolean;
}

export interface Manhwa {
  id: string;
  name: string;
  path: string;
  chapters: Chapter[];
  addedAt: string;
}
