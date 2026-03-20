import { useState } from "react";
import type { Conversation, ContactUser } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Props = {
  conversations: Conversation[];
  activeConv: Conversation | null;
  onSelectConv: (conv: Conversation) => void;
  allUsers: ContactUser[];
  onOpenChat: (user: ContactUser) => void;
};

export default function ChatList({ conversations, activeConv, onSelectConv, allUsers, onOpenChat }: Props) {
  const [search, setSearch] = useState("");
  const [showUsers, setShowUsers] = useState(false);

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 flex flex-col border-r border-border bg-card shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-golos font-bold text-lg text-foreground">Сообщения</h2>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
            title="Новый чат"
          >
            <Icon name={showUsers ? "X" : "Plus"} size={16} />
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
        {showUsers ? (
          <>
            <p className="px-4 py-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Новый чат</p>
            {filteredUsers.map((user, i) => (
              <button
                key={user.id}
                onClick={() => { onOpenChat(user); setShowUsers(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl hover:bg-secondary/50 transition-all text-left animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: user.color + "33", border: `1.5px solid ${user.color}55`, color: user.color }}
                  >
                    {user.avatar}
                  </div>
                  {user.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground">@{user.username}</div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">Нет пользователей</p>
            )}
          </>
        ) : (
          <>
            {filtered.map((conv, i) => (
              <button
                key={conv.conversation_id}
                onClick={() => onSelectConv(conv)}
                className={`w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl transition-all duration-200 text-left
                  ${activeConv?.user.id === conv.user.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/50"
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: conv.user.color + "33", border: `1.5px solid ${conv.user.color}55`, color: conv.user.color }}
                  >
                    {conv.user.avatar}
                  </div>
                  {conv.user.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{conv.user.name}</span>
                    <span className="text-xs text-muted-foreground ml-1 shrink-0">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{conv.last_message || "Начните переписку"}</span>
                    {conv.unread > 0 && (
                      <span className="ml-1 shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {conv.unread > 9 ? "9+" : conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Нет диалогов</p>
                <p className="text-xs text-muted-foreground mt-1">Нажмите + чтобы начать чат</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
