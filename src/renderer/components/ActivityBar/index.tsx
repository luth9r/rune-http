import { Database, Settings, Globe, FolderTree } from "lucide-react";
import { Button } from "../ui/button";
import "./activity-bar.css";

export function ActivityBar({ currentView, setView }) {
  return (
    <aside className="activity-bar">
      <div className="activity-bar-top">
        <Button
          active={currentView === "explorer"}
          onClick={() => setView("explorer")}
          variant="tab"
          className="activity-btn"
        >
          <FolderTree size={20} />
        </Button>

        <Button
          active={currentView === "env"}
          onClick={() => setView("env")}
          variant="tab"
          className="activity-btn"
        >
          <Globe size={20} />
        </Button>

        <Button
          active={currentView === "database"}
          onClick={() => setView("database")}
          variant="tab"
          className="activity-btn"
        >
          <Database size={20} />
        </Button>
      </div>

      <div className="activity-bar-bottom">
        <Button
          active={currentView === "settings"}
          onClick={() => setView("settings")}
          variant="tab"
          className="activity-btn"
        >
          <Settings size={20} />
        </Button>
      </div>
    </aside>
  );
}
