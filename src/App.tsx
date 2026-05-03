import { useState } from "react";
import { Library } from "./views/Library";
import { ManhwaDetail } from "./views/ManhwaDetail";
import { Reader } from "./views/Reader";
import type { View } from "./types";
import "./App.css";

function App() {
  const [view, setView] = useState<View>({ type: "library" });

  switch (view.type) {
    case "library":
      return <Library onNavigate={setView} />;
    case "detail":
      return <ManhwaDetail manhwaId={view.manhwaId} onNavigate={setView} />;
    case "reader":
      return (
        <Reader
          manhwaId={view.manhwaId}
          chapterIdx={view.chapterIdx}
          onNavigate={setView}
        />
      );
  }
}

export default App;
