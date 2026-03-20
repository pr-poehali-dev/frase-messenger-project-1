import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { useState } from "react";

type Props = {
  chats: Chat[];
  onCall: (chat: Chat) => void;
};

export default function ContactsPanel({ chats, onCall }: Props) {
  const [search, setSearch] = useState("");
  const filtered = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-golos font-bold text-xl text-foreground mb-4">Контакты</h1>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти контакт..."
            className="w-full bg-secondary/60 rounded-xl pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 max-w-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: c.color + "22", border: `1.5px solid ${c.color}44`, color: c.color }}
                >
                  {c.avatar}
                </div>
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.online ? "онлайн" : "не в сети"}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onCall(c)}
                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Icon name="Phone" size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
                  <Icon name="MessageSquare" size={14} />
                </button>
              </div>
            </div>
          ))}
          <button className="glass rounded-2xl p-4 flex items-center gap-3 border-dashed hover:border-primary/40 transition-all text-muted-foreground hover:text-primary">
            <div className="w-12 h-12 rounded-xl border border-dashed border-current flex items-center justify-center">
              <Icon name="UserPlus" size={18} />
            </div>
            <span className="text-sm font-medium">Добавить контакт</span>
          </button>
        </div>
      </div>
    </div>
  );
}
