import { useRef, useState, useEffect } from "react";
import type { Conversation, ChatMessage, ContactUser } from "@/lib/api";
import { deleteMessage } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Props = {
  conv: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  onSend: (text: string, type?: "text" | "voice", duration?: string) => void;
  onCall: (user: ContactUser) => void;
  onMessageDeleted: (id: number) => void;
};

function formatLastSeen(isoStr?: string | null): string {
  if (!isoStr) return "не в сети";
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return "только что в сети";
  if (diffMin < 60) return `был(а) ${diffMin} мин. назад`;
  if (diffHours < 24) return `был(а) ${diffHours} ч. назад`;
  if (diffDays === 1) return "был(а) вчера";
  return `был(а) ${diffDays} дн. назад`;
}

export default function ChatWindow({ conv, messages, loading, onSend, onCall, onMessageDeleted }: Props) {
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecord = () => {
    if (!recording) {
      setRecording(true);
      setRecordSecs(0);
      intervalRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } else {
      setRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const mins = Math.floor(recordSecs / 60);
      const secs = recordSecs % 60;
      const dur = `${mins}:${String(secs).padStart(2, "0")}`;
      onSend("", "voice", dur);
      setRecordSecs(0);
    }
  };

  const fmtSecs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl msg-gradient flex items-center justify-center mx-auto neon-glow-purple">
            <Icon name="MessageSquare" size={28} className="text-white" />
          </div>
          <p className="text-muted-foreground font-rubik">Выберите чат для начала общения</p>
        </div>
      </div>
    );
  }

  const user = conv.user;

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <header className="px-5 py-3.5 border-b border-border flex items-center justify-between glass shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
            style={{ background: user.color + "22", border: `1.5px solid ${user.color}44`, color: user.color }}
          >
            {user.avatar}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{user.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {user.online ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block" />онлайн</>
              ) : (
                formatLastSeen(user.last_seen)
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <HeaderBtn icon="Phone" onClick={() => onCall(user)} />
          <HeaderBtn icon="Video" onClick={() => onCall(user)} />
          <HeaderBtn icon="MoreVertical" onClick={() => {}} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={20} className="text-muted-foreground animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
              style={{ background: user.color + "22", color: user.color }}
            >
              {user.avatar}
            </div>
            <p className="text-sm text-muted-foreground">Начните переписку с {user.name}</p>
          </div>
        )}
        {!loading && messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} user={user} delay={i} onDelete={onMessageDeleted} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border glass shrink-0">
        {recording ? (
          <div className="flex items-center gap-3 h-11">
            <button onClick={toggleRecord} className="text-destructive hover:text-destructive/80">
              <Icon name="Trash2" size={18} />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="animate-record w-2 h-2 rounded-full bg-destructive" />
              <WaveVisualizer />
              <span className="text-sm text-muted-foreground font-mono">{fmtSecs(recordSecs)}</span>
            </div>
            <button
              onClick={toggleRecord}
              className="w-9 h-9 rounded-xl msg-gradient flex items-center justify-center neon-glow-purple"
            >
              <Icon name="Send" size={16} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Paperclip" size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Написать сообщение..."
                rows={1}
                className="w-full bg-secondary/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                style={{ maxHeight: 120 }}
              />
            </div>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Smile" size={18} />
            </button>
            {input.trim() ? (
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-xl msg-gradient flex items-center justify-center neon-glow-purple transition-all hover:scale-105"
              >
                <Icon name="Send" size={16} className="text-white" />
              </button>
            ) : (
              <button
                onClick={toggleRecord}
                className="w-9 h-9 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground flex items-center justify-center transition-all"
              >
                <Icon name="Mic" size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderBtn({ icon, onClick }: { icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 flex items-center justify-center transition-all"
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function MessageBubble({
  msg,
  user,
  delay,
  onDelete,
}: {
  msg: ChatMessage;
  user: { avatar: string; color: string };
  delay: number;
  onDelete: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!msg.mine || msg.deleted) return;
    setDeleting(true);
    const ok = await deleteMessage(msg.id);
    if (ok) onDelete(msg.id);
    else setDeleting(false);
  };

  return (
    <div
      className={`flex ${msg.mine ? "justify-end" : "justify-start"} animate-fade-in group`}
      style={{ animationDelay: `${Math.min(delay * 20, 200)}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!msg.mine && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold mr-2 self-end mb-1 shrink-0"
          style={{ background: user.color + "22", color: user.color }}
        >
          {user.avatar}
        </div>
      )}

      <div className="flex items-end gap-1.5">
        {msg.mine && hovered && !msg.deleted && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mb-1 w-6 h-6 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <Icon name={deleting ? "Loader2" : "Trash2"} size={12} className={deleting ? "animate-spin" : ""} />
          </button>
        )}

        <div
          className={`max-w-[65%] rounded-2xl px-4 py-2.5 ${
            msg.mine
              ? "msg-gradient text-white rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          } ${msg.deleted ? "opacity-50" : ""}`}
        >
          {msg.deleted ? (
            <p className="text-sm italic opacity-70">Сообщение удалено</p>
          ) : msg.type === "voice" ? (
            <VoiceMessage duration={msg.duration || "0:00"} mine={msg.mine} />
          ) : (
            <p className="text-sm leading-relaxed">{msg.text}</p>
          )}
          <div className={`text-[10px] mt-1 ${msg.mine ? "text-white/60 text-right" : "text-muted-foreground text-right"}`}>
            {msg.time}
            {msg.mine && !msg.deleted && <Icon name="CheckCheck" size={10} className="inline ml-1 text-white/60" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceMessage({ duration, mine }: { duration: string; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button
        onClick={() => setPlaying(!playing)}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${mine ? "bg-white/20" : "bg-primary/20"}`}
      >
        <Icon name={playing ? "Pause" : "Play"} size={13} className={mine ? "text-white" : "text-primary"} />
      </button>
      <div className="flex-1 flex items-center gap-0.5 h-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`w-0.5 rounded-full wave-bar ${mine ? "bg-white/60" : "bg-primary/60"}`}
            style={{
              height: `${20 + Math.sin(i * 0.8) * 14}px`,
              animationDelay: playing ? `${i * 60}ms` : "0ms",
              animationPlayState: playing ? "running" : "paused",
            }}
          />
        ))}
      </div>
      <span className={`text-xs font-mono shrink-0 ${mine ? "text-white/70" : "text-muted-foreground"}`}>
        {duration}
      </span>
    </div>
  );
}

function WaveVisualizer() {
  return (
    <div className="flex items-center gap-0.5 h-6 flex-1">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="w-0.5 rounded-full bg-destructive/60 wave-bar"
          style={{
            height: `${12 + Math.sin(i * 0.7) * 8}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}
