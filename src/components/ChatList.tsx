import { useState } from "react";
import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

type Props = {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
};

export default function ChatList({ chats, activeChat, onSelectChat }: Props) {
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 flex flex-col border-r border-border bg-card shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-golos font-bold text-lg text-foreground">Сообщения</h2>
          <button className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center">
            <Icon name="Plus" size={16} />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-secondary/60 rounded-xl pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {filtered.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl transition-all duration-200 text-left
              ${activeChat?.id === chat.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-secondary/50"
              }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                style={{ background: chat.color + "33", border: `1.5px solid ${chat.color}55`, color: chat.color }}
              >
                {chat.avatar}
              </div>
              {chat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-card" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate">{chat.name}</span>
                <span className="text-xs text-muted-foreground ml-1 shrink-0">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-muted-foreground truncate">{chat.lastMessage}</span>
                {chat.unread > 0 && (
                  <span className="ml-1 shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {chat.unread > 9 ? "9+" : chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
