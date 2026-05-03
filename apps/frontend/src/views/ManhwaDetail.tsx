import { useState, useEffect, useRef, useCallback } from "react";
import {
  getLibrary,
  deleteManhwa,
  updateManhwaName,
  markChapterRead,
  markChaptersRead,
} from "../api";
import type { Manhwa, View } from "../types";
import "./ManhwaDetail.css";

interface Props {
  manhwaId: string;
  onNavigate: (view: View) => void;
}

export function ManhwaDetail({ manhwaId, onNavigate }: Props) {
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editName, setEditName] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const lastClickedRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadManhwa();
  }, [manhwaId]);

  const closeMenu = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", closeMenu);
      return () => document.removeEventListener("mousedown", closeMenu);
    }
  }, [menuOpen, closeMenu]);

  async function loadManhwa() {
    const lib = await getLibrary();
    const m = lib.find((item) => item.id === manhwaId) ?? null;
    setManhwa(m);
    if (m) setEditName(m.name);
  }

  function handleStartRename() {
    if (!manhwa) return;
    setEditName(manhwa.name);
    setRenaming(true);
    setMenuOpen(false);
  }

  async function handleSaveName() {
    if (!manhwa || editName.trim() === "") return;
    await updateManhwaName(manhwa.id, editName.trim());
    setManhwa({ ...manhwa, name: editName.trim() });
    setRenaming(false);
  }

  function handleResetProgress() {
    setMenuOpen(false);
    setConfirmingReset(true);
  }

  async function handleConfirmReset() {
    if (!manhwa) return;
    const allIndices = manhwa.chapters.map((_, i) => i);
    await markChaptersRead(manhwa.id, allIndices, false);
    const resetChapters = manhwa.chapters.map((ch) => ({ ...ch, read: false }));
    setManhwa({ ...manhwa, chapters: resetChapters });
    setConfirmingReset(false);
  }

  function handleDelete() {
    setMenuOpen(false);
    setConfirmingDelete(true);
  }

  async function handleConfirmDelete() {
    if (!manhwa) return;
    await deleteManhwa(manhwa.id);
    onNavigate({ type: "library" });
  }

  async function handleToggleRead(idx: number) {
    if (!manhwa) return;
    const chapter = manhwa.chapters[idx];
    const newRead = !chapter.read;
    await markChapterRead(manhwa.id, idx, newRead);
    const updatedChapters = [...manhwa.chapters];
    updatedChapters[idx] = { ...chapter, read: newRead };
    setManhwa({ ...manhwa, chapters: updatedChapters });
  }

  function handleRowClick(idx: number, e: React.MouseEvent) {
    if (e.shiftKey && lastClickedRef.current !== null) {
      const from = Math.min(lastClickedRef.current, idx);
      const to = Math.max(lastClickedRef.current, idx);
      const range = new Set(selected);
      for (let i = from; i <= to; i++) range.add(i);
      setSelected(range);
    } else if (e.metaKey) {
      const next = new Set(selected);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      setSelected(next);
    } else {
      if (selected.size === 1 && selected.has(idx)) {
        setSelected(new Set());
      } else {
        setSelected(new Set([idx]));
      }
    }
    lastClickedRef.current = idx;
  }

  async function handleBulkMark(read: boolean) {
    if (!manhwa) return;
    const indices = Array.from(selected);
    await markChaptersRead(manhwa.id, indices, read);
    const updatedChapters = [...manhwa.chapters];
    for (const idx of indices) {
      updatedChapters[idx] = { ...updatedChapters[idx], read };
    }
    setManhwa({ ...manhwa, chapters: updatedChapters });
    setSelected(new Set());
  }

  async function handleReadAgain() {
    if (!manhwa) return;
    const allIndices = manhwa.chapters.map((_, i) => i);
    await markChaptersRead(manhwa.id, allIndices, false);
    const resetChapters = manhwa.chapters.map((ch) => ({ ...ch, read: false }));
    setManhwa({ ...manhwa, chapters: resetChapters });
    onNavigate({ type: "reader", manhwaId: manhwa.id, chapterIdx: 0 });
  }

  if (!manhwa) return <div className="loading">Loading...</div>;

  const readCount = manhwa.chapters.filter((c) => c.read).length;
  const totalCount = manhwa.chapters.length;
  const progressPct =
    totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const allRead = readCount === totalCount && totalCount > 0;
  const lastReadIdx = manhwa.chapters.reduce(
    (last, ch, i) => (ch.read ? i : last),
    -1,
  );
  const nextChapterIdx = allRead ? -1 : lastReadIdx + 1 < totalCount ? lastReadIdx + 1 : 0;

  const selectedArr = Array.from(selected);
  const showBulkBar = selectedArr.length >= 2;
  const allSelectedRead =
    showBulkBar && selectedArr.every((i) => manhwa.chapters[i].read);
  const allSelectedUnread =
    showBulkBar && selectedArr.every((i) => !manhwa.chapters[i].read);

  return (
    <div className={`manhwa-detail ${showBulkBar ? "has-bulk-bar" : ""}`}>
      <header className="detail-header">
        <div className="header-row">
          <button
            onClick={() => onNavigate({ type: "library" })}
            className="back-btn"
          >
            &larr; Library
          </button>
          <div className="settings-wrapper" ref={menuRef}>
            <button
              className="gear-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            {menuOpen && (
              <div className="settings-menu">
                <button className="settings-menu-item" onClick={handleStartRename}>
                  Rename
                </button>
                <button className="settings-menu-item danger" onClick={handleResetProgress}>
                  Reset reading progress
                </button>
                <button className="settings-menu-item danger" onClick={handleDelete}>
                  Remove from collection
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="title-section">
          {renaming ? (
            <div className="edit-name">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setRenaming(false);
                }}
                autoFocus
              />
              <button onClick={handleSaveName}>Save</button>
              <button onClick={() => setRenaming(false)}>Cancel</button>
            </div>
          ) : (
            <h1>{manhwa.name}</h1>
          )}
        </div>
      </header>


      {totalCount > 0 && (
        <div className="action-row">
          <svg className="donut" viewBox="0 0 36 36">
            <circle
              className="donut-track"
              cx="18" cy="18" r="14"
              fill="none"
              strokeWidth="5"
            />
            <circle
              className="donut-fill"
              cx="18" cy="18" r="14"
              fill="none"
              strokeWidth="5"
              strokeDasharray={`${progressPct * 0.88} ${88 - progressPct * 0.88}`}
              strokeDashoffset="22"
              strokeLinecap="round"
            />
            <text x="18" y="18" className="donut-text">
              {progressPct}
            </text>
          </svg>
          {allRead ? (
            <button className="continue-btn" onClick={handleReadAgain}>
              Read Again
            </button>
          ) : (
            <button
              className="continue-btn"
              onClick={() =>
                onNavigate({
                  type: "reader",
                  manhwaId: manhwa.id,
                  chapterIdx: nextChapterIdx,
                })
              }
            >
              {readCount === 0 ? "Start Reading" : "Continue Reading"}
            </button>
          )}
        </div>
      )}

      <div className="chapter-list">
        {manhwa.chapters.map((chapter, idx) => (
          <div
            key={idx}
            className={`chapter-item ${chapter.read ? "read" : "unread"} ${selected.has(idx) ? "selected" : ""}`}
            onMouseDown={(e) => { if (e.shiftKey) e.preventDefault(); }}
            onClick={(e) => handleRowClick(idx, e)}
          >
            <button
              className="read-toggle"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleRead(idx);
              }}
              title={chapter.read ? "Mark as unread" : "Mark as read"}
            >
              {chapter.read ? "\u25CF" : "\u25CB"}
            </button>
            <span className="chapter-number">
              #{String(chapter.number).padStart(3, "0")}
            </span>
            <span
              className="chapter-name"
              onClick={(e) => {
                if (e.shiftKey || e.metaKey) return;
                e.stopPropagation();
                onNavigate({
                  type: "reader",
                  manhwaId: manhwa.id,
                  chapterIdx: idx,
                });
              }}
            >
              {chapter.name}
            </span>
          </div>
        ))}
      </div>

      {showBulkBar && (
        <div className="bulk-bar">
          <span className="bulk-count">{selectedArr.length} selected</span>
          <button
            className="bulk-btn"
            disabled={allSelectedRead}
            onClick={() => handleBulkMark(true)}
          >
            Mark as Read
          </button>
          <button
            className="bulk-btn"
            disabled={allSelectedUnread}
            onClick={() => handleBulkMark(false)}
          >
            Mark as Unread
          </button>
        </div>
      )}

      {confirmingReset && (
        <div className="confirm-overlay" onClick={() => setConfirmingReset(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-title">Reset reading progress?</p>
            <p className="confirm-message">
              All chapters of "{manhwa.name}" will be marked as unread.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </button>
              <button className="confirm-delete" onClick={handleConfirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmingDelete(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-title">Remove from collection?</p>
            <p className="confirm-message">
              Your reading progress for "{manhwa.name}" will be permanently deleted. Your chapter files and folder will not be affected.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button className="confirm-delete" onClick={handleConfirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
