import Icon from "@/components/ui/icon";
import { Section } from "@/pages/Index";
import type { User } from "@/lib/api";

type Props = {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  currentUser: User;
  onLogout: () => void;
};

const NAV = [
  { id: "chats" as Section, icon: "MessageSquare", label: "Чаты" },
  { id: "contacts" as Section, icon: "Users", label: "Контакты" },
  { id: "media" as Section, icon: "Image", label: "Медиа" },
  { id: "notifications" as Section, icon: "Bell", label: "Уведомления" },
];

const BOTTOM_NAV = [
  { id: "settings" as Section, icon: "Settings", label: "Настройки" },
  { id: "profile" as Section, icon: "User", label: "Профиль" },
];

export default function Sidebar({ activeSection, onSectionChange, currentUser }: Props) {
  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-2 border-r border-border bg-card shrink-0">
      <div className="mb-4 w-10 h-10 rounded-xl msg-gradient flex items-center justify-center neon-glow-purple shrink-0">
        <span className="text-white font-golos font-bold text-sm">Ф</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => (
          <SidebarBtn
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        {BOTTOM_NAV.map((item) => (
          <SidebarBtn
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
        <button
          onClick={() => onSectionChange("profile")}
          title={currentUser.name}
          className="mt-2 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-all"
          style={{ background: currentUser.color + "33", border: `1.5px solid ${currentUser.color}66`, color: currentUser.color }}
        >
          {currentUser.avatar}
        </button>
      </div>
    </aside>
  );
}

function SidebarBtn({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative
        ${active
          ? "bg-primary/20 text-primary neon-glow-purple"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
    >
      <Icon name={icon} size={18} />
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
    </button>
  );
}