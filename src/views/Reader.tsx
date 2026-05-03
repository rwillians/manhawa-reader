import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getChapterPdf, getLibrary, markChapterRead } from "../api";
import type { Manhwa, View } from "../types";
import "./Reader.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

interface Props {
  manhwaId: string;
  chapterIdx: number;
  onNavigate: (view: View) => void;
}

export function Reader({ manhwaId, chapterIdx, onNavigate }: Props) {
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    getLibrary().then((lib) => {
      const m = lib.find((item) => item.id === manhwaId) ?? null;
      setManhwa(m);
    });
  }, [manhwaId]);

  useEffect(() => {
    if (!manhwa) return;

    setLoading(true);
    let cancelled = false;

    async function loadPdf() {
      const data = await getChapterPdf(manhwaId, chapterIdx);
      if (cancelled) return;

      const pdf = await pdfjsLib.getDocument({ data }).promise;
      if (cancelled || !pagesRef.current) return;

      pagesRef.current.innerHTML = "";

      const containerWidth = pagesRef.current.clientWidth || window.innerWidth;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.width = "100%";
        canvas.style.display = "block";

        const context = canvas.getContext("2d")!;
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        if (cancelled || !pagesRef.current) return;
        pagesRef.current.appendChild(canvas);
      }

      setLoading(false);

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [manhwa, manhwaId, chapterIdx]);

  const handleMouseMove = useCallback(() => {
    setNavVisible(true);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(
      () => setNavVisible(false),
      3000,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  async function handleNextChapter() {
    if (!manhwa) return;
    await markChapterRead(manhwaId, chapterIdx, true);

    if (chapterIdx < manhwa.chapters.length - 1) {
      onNavigate({
        type: "reader",
        manhwaId,
        chapterIdx: chapterIdx + 1,
      });
    } else {
      onNavigate({ type: "detail", manhwaId });
    }
  }

  if (!manhwa) return null;

  const chapter = manhwa.chapters[chapterIdx];
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < manhwa.chapters.length - 1;
  const isLast = chapterIdx === manhwa.chapters.length - 1;

  return (
    <div className="reader" ref={containerRef} onMouseMove={handleMouseMove}>
      <nav className={`reader-nav ${navVisible ? "visible" : ""}`}>
        <button
          className="nav-btn"
          disabled={!hasPrev}
          onClick={() =>
            onNavigate({
              type: "reader",
              manhwaId,
              chapterIdx: chapterIdx - 1,
            })
          }
        >
          &#8592; Prev
        </button>
        <div className="nav-title">
          <span
            className="manhwa-link"
            onClick={() => onNavigate({ type: "detail", manhwaId })}
          >
            {manhwa.name}
          </span>
          <span className="chapter-separator"> &mdash; </span>
          <span>{chapter.name}</span>
        </div>
        <button
          className="nav-btn"
          disabled={!hasNext}
          onClick={() =>
            onNavigate({
              type: "reader",
              manhwaId,
              chapterIdx: chapterIdx + 1,
            })
          }
        >
          Next &#8594;
        </button>
      </nav>

      {loading && <div className="reader-loading">Loading chapter...</div>}

      <div className="reader-pages" ref={pagesRef} />

      {!loading && (
        <div className="reader-footer">
          <button className="next-chapter-btn" onClick={handleNextChapter}>
            {isLast ? "Finish & Return" : "Mark as Read & Next Chapter"}
          </button>
        </div>
      )}
    </div>
  );
}
