import { useState } from "react";
import Icon from "@/components/ui/icon";
import { logout } from "@/lib/api";

const SECTIONS = [
  {
    title: "Аккаунт",
    items: [
      { icon: "User", label: "Личные данные", desc: "Имя, фото, статус", color: "#a855f7" },
      { icon: "Lock", label: "Приватность", desc: "Кто видит ваш профиль", color: "#6366f1" },
      { icon: "Shield", label: "Безопасность", desc: "Пароль, 2FA", color: "#22d3ee" },
    ],
  },
  {
    title: "Мессенджер",
    items: [
      { icon: "Bell", label: "Уведомления", desc: "Звуки, вибрация", color: "#f59e0b" },
      { icon: "Palette", label: "Внешний вид", desc: "Тема, шрифт", color: "#ec4899" },
      { icon: "Globe", label: "Язык", desc: "Русский", color: "#10b981" },
    ],
  },
  {
    title: "Данные и хранилище",
    items: [
      { icon: "HardDrive", label: "Хранилище", desc: "148 МБ из 5 ГБ", color: "#a855f7" },
      { icon: "Download", label: "Загрузки", desc: "Авто-загрузка медиа", color: "#6366f1" },
    ],
  },
  {
    title: "Поддержка",
    items: [
      { icon: "HelpCircle", label: "Помощь", desc: "Справка и FAQ", color: "#22d3ee" },
      { icon: "Info", label: "О приложении", desc: "ФРАСЕ v1.0.0", color: "#6366f1" },
    ],
  },
];

export default function SettingsPanel({ onLogout }: { onLogout: () => void }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifs, setNotifs] = useState(true);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-golos font-bold text-xl text-foreground">Настройки</h1>

        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl msg-gradient flex items-center justify-center text-xl font-bold text-white">
            ВМ
          </div>
          <div>
            <div className="font-semibold text-foreground">Ваш профиль</div>
            <div className="text-sm text-muted-foreground">@me · онлайн</div>
          </div>
          <button className="ml-auto w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ChevronRight" size={14} />
          </button>
        </div>

        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Moon" size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Тёмная тема</div>
              <div className="text-xs text-muted-foreground">Текущая тема приложения</div>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-10 h-5 rounded-full transition-all relative ${theme === "dark" ? "bg-primary" : "bg-secondary"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${theme === "dark" ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Bell" size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Уведомления</div>
              <div className="text-xs text-muted-foreground">Все звуки и оповещения</div>
            </div>
          </div>
          <button
            onClick={() => setNotifs(!notifs)}
            className={`w-10 h-5 rounded-full transition-all relative ${notifs ? "bg-primary" : "bg-secondary"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${notifs ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="glass rounded-2xl divide-y divide-border">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-secondary/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.color + "22" }}>
                    <Icon name={item.icon} size={14} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleLogout} className="w-full glass rounded-2xl py-3.5 text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm flex items-center justify-center gap-2">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}