import Icon from "@/components/ui/icon";

const STATS = [
  { label: "Сообщений", value: "1 284" },
  { label: "Контактов", value: "36" },
  { label: "Медиафайлов", value: "148" },
];

export default function ProfilePanel() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-golos font-bold text-xl text-foreground">Профиль</h1>

        <div className="glass rounded-3xl p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl msg-gradient flex items-center justify-center text-3xl font-bold text-white neon-glow-purple">
              ВМ
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Icon name="Camera" size={12} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-golos font-bold text-xl text-foreground">Вы</h2>
            <p className="text-sm text-muted-foreground">@me · ФРАСЕ ID: #0001</p>
          </div>
          <div className="flex gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-golos font-bold text-lg text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl divide-y divide-border">
          {[
            { icon: "User", label: "Имя", value: "Ваше имя" },
            { icon: "Phone", label: "Телефон", value: "+7 (999) 000-00-00" },
            { icon: "Mail", label: "Email", value: "you@frase.app" },
            { icon: "FileText", label: "О себе", value: "Привет! Я в ФРАСЕ 👋" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name={item.icon} size={14} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm text-foreground">{item.value}</div>
              </div>
              <Icon name="Pencil" size={14} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center shrink-0" style={{ background: "#10b98122" }}>
              <Icon name="Shield" size={14} className="text-neon-green" style={{ color: "#10b981" }} />
            </div>
            <span className="text-sm text-foreground flex-1">Двухфакторная аутентификация</span>
            <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full font-medium" style={{ color: "#10b981", background: "#10b98122" }}>Включено</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="Lock" size={14} className="text-primary" />
            </div>
            <span className="text-sm text-foreground flex-1">Конфиденциальность</span>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
