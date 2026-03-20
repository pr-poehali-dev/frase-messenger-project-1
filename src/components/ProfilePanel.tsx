import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { User } from "@/lib/api";
import { updateAvatar } from "@/lib/api";

const STATS = [
  { label: "Сообщений", value: "0" },
  { label: "Контактов", value: "0" },
  { label: "Медиафайлов", value: "0" },
];

const AVATAR_GALLERY = [
  "😊", "😎", "🤩", "🥳", "😍", "🤓", "😏", "🧐",
  "🦊", "🐱", "🐶", "🐼", "🦁", "🐸", "🐧", "🦋",
  "🚀", "🌙", "⭐", "🔥", "💎", "👑", "🎮", "🎯",
  "🍕", "🍦", "🎸", "🎨", "🏆", "💡", "🌈", "✨",
];

export default function ProfilePanel({ user, onAvatarChange }: { user: User; onAvatarChange?: (avatar: string) => void }) {
  const [avatar, setAvatar] = useState(user.avatar);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async (emoji: string) => {
    setSaving(true);
    const ok = await updateAvatar(emoji);
    if (ok) {
      setAvatar(emoji);
      onAvatarChange?.(emoji);
    }
    setSaving(false);
    setShowGallery(false);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-golos font-bold text-xl text-foreground">Профиль</h1>

        <div className="glass rounded-3xl p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold neon-glow-purple"
              style={{ background: user.color + "33", border: `2px solid ${user.color}66`, color: user.color }}
            >
              {avatar}
            </div>
            <button
              onClick={() => setShowGallery(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors"
            >
              <Icon name="Camera" size={12} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-golos font-bold text-xl text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">@{user.username} · ФРАСЕ ID: #{String(user.id).padStart(4, "0")}</p>
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

        {showGallery && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Выберите аватар</span>
              <button
                onClick={() => setShowGallery(false)}
                className="w-6 h-6 rounded-lg hover:bg-secondary/60 flex items-center justify-center text-muted-foreground"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_GALLERY.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handlePickAvatar(emoji)}
                  disabled={saving}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-primary/10 ${
                    emoji === avatar ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {saving && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-1">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Сохранение...
              </div>
            )}
          </div>
        )}

        <div className="glass rounded-2xl divide-y divide-border">
          {[
            { icon: "User", label: "Имя", value: user.name },
            { icon: "AtSign", label: "Username", value: "@" + user.username },
            { icon: "Mail", label: "Email", value: user.email },
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
