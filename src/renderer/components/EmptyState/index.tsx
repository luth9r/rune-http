import { Plus } from "lucide-react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import "./empty-state.css";

export function EmptyState() {
  const { t } = useTranslation();
  const openTab = useTabsStore((state) => state.openTab);

  return (
    <div className="empty-state">
      <Logo className="empty-state-logo" size="lg" />

      <div className="empty-state-actions">
        <Button
          className="empty-state-btn"
          onClick={() => openTab()}
          size="lg"
          variant="primary"
        >
          <Plus size={18} />
          <span>{t('empty.new_request')}</span>
          <span className="empty-state-shortcut">Ctrl+N</span>
        </Button>

        <p className="empty-state-hint">
          {t('empty.search_hint').split('{{shortcut}}')[0]}
          <kbd className="kbd">Ctrl+F</kbd>
          {t('empty.search_hint').split('{{shortcut}}')[1]}
        </p>
      </div>
    </div>
  );
}
