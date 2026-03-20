import Icon from "@/components/ui/icon";

const NOTIFICATIONS = [
  { id: 1, type: "message", icon: "MessageSquare", color: "#a855f7", title: "Алиса Новикова", text: "Окей, буду в 18:00!", time: "2 мин назад", read: false },
  { id: 2, type: "call", icon: "Phone", color: "#10b981", title: "Входящий звонок", text: "Максим Орлов · 3:42", time: "15 мин назад", read: false },
  { id: 3, type: "group", icon: "Users", color: "#22d3ee", title: "Команда ФРАСЕ", text: "Новый дизайн выглядит 🔥", time: "1 час назад", read: true },
  { id: 4, type: "message", icon: "MessageSquare", color: "#ec4899", title: "Катя Светлова", text: "Посмотри файлы в медиа", time: "3 часа назад", read: true },
  { id: 5, type: "call", icon: "PhoneMissed", color: "#ef4444", title: "Пропущенный звонок", text: "Игорь Данилов", time: "вчера", read: true },
  { id: 6, type: "system", icon: "Bell", color: "#f59e0b", title: "ФРАСЕ", text: "Добро пожаловать! Профиль настроен.", time: "вчера", read: true },
];

export default function NotificationsPanel() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-golos font-bold text-xl text-foreground">Уведомления</h1>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
            Прочитать все
          </button>
        </div>

        <div className="space-y-2">
          {NOTIFICATIONS.map((n, i) => (
            <div
              key={n.id}
              className={`glass rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all animate-fade-in ${!n.read ? "border-primary/20" : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: n.color + "22", border: `1px solid ${n.color}33` }}
              >
                <Icon name={n.icon} size={16} style={{ color: n.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{n.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{n.text}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 glass rounded-2xl p-4">
          <h3 className="font-golos font-semibold text-sm text-foreground mb-3">Настройки уведомлений</h3>
          <div className="space-y-3">
            {[
              { label: "Сообщения", enabled: true },
              { label: "Звонки", enabled: true },
              { label: "Групповые чаты", enabled: true },
              { label: "Системные", enabled: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <button
                  className={`w-10 h-5 rounded-full transition-all ${s.enabled ? "bg-primary" : "bg-secondary"} relative`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.enabled ? "left-5" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
