import { useState, useEffect } from "react";
import { getLibrary, importManhwa } from "../api";
import type { Manhwa, View } from "../types";
import "./Library.css";

interface Props {
  onNavigate: (view: View) => void;
}

export function Library({ onNavigate }: Props) {
  const [manhwas, setManhwas] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    setLoading(true);
    const lib = await getLibrary();
    setManhwas(lib);
    setLoading(false);
  }

  async function handleImport() {
    const manhwa = await importManhwa();
    if (manhwa) {
      setManhwas((prev) => [...prev, manhwa]);
    }
  }

  function getProgress(manhwa: Manhwa): string {
    const read = manhwa.chapters.filter((c) => c.read).length;
    const total = manhwa.chapters.length;
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return `${pct}% (${read}/${total})`;
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="library">
      <header className="library-header">
        <h1>Manhawa Reader</h1>
        <button onClick={handleImport} className="import-btn">
          Import Manhawa
        </button>
      </header>

      {manhwas.length === 0 ? (
        <div className="empty-state">
          <p>No manhawas in your collection yet.</p>
          <p>Click "Import Manhawa" to add one.</p>
        </div>
      ) : (
        <div className="manhwa-grid">
          {manhwas.map((manhwa) => (
            <div
              key={manhwa.id}
              className="manhwa-card"
              onClick={() =>
                onNavigate({ type: "detail", manhwaId: manhwa.id })
              }
            >
              <h3>{manhwa.name}</h3>
              <p className="chapter-count">
                {manhwa.chapters.length} chapters
              </p>
              <p className="progress">{getProgress(manhwa)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
