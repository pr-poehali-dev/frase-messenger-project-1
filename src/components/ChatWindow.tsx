import { useRef, useState, useEffect } from "react";
import { Chat, Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";

type Props = {
  chat: Chat | null;
  messages: Message[];
  onSend: (text: string, type?: "text" | "voice", duration?: string) => void;
  onCall: (chat: Chat) => void;
};

export default function ChatWindow({ chat, messages, onSend, onCall }: Props) {
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

  if (!chat) {
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

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <header className="px-5 py-3.5 border-b border-border flex items-center justify-between glass shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
            style={{ background: chat.color + "22", border: `1.5px solid ${chat.color}44`, color: chat.color }}
          >
            {chat.avatar}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{chat.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {chat.online ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block" />онлайн</>
              ) : "не в сети"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <HeaderBtn icon="Phone" onClick={() => onCall(chat)} />
          <HeaderBtn icon="Video" onClick={() => onCall(chat)} />
          <HeaderBtn icon="Search" onClick={() => {}} />
          <HeaderBtn icon="MoreVertical" onClick={() => {}} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} chat={chat} delay={i} />
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

function MessageBubble({ msg, chat, delay }: { msg: Message; chat: Chat; delay: number }) {
  return (
    <div
      className={`flex ${msg.mine ? "justify-end" : "justify-start"} animate-fade-in`}
      style={{ animationDelay: `${Math.min(delay * 20, 200)}ms` }}
    >
      {!msg.mine && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold mr-2 self-end mb-1 shrink-0"
          style={{ background: chat.color + "22", color: chat.color }}
        >
          {chat.avatar}
        </div>
      )}
      <div
        className={`max-w-[65%] rounded-2xl px-4 py-2.5 ${
          msg.mine
            ? "msg-gradient text-white rounded-br-sm"
            : "bg-secondary text-foreground rounded-bl-sm"
        }`}
      >
        {msg.type === "voice" ? (
          <VoiceMessage duration={msg.duration || "0:00"} mine={msg.mine} />
        ) : (
          <p className="text-sm leading-relaxed">{msg.text}</p>
        )}
        <div className={`text-[10px] mt-1 ${msg.mine ? "text-white/60 text-right" : "text-muted-foreground text-right"}`}>
          {msg.time}
          {msg.mine && <Icon name="CheckCheck" size={10} className="inline ml-1 text-white/60" />}
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
          className="w-0.5 bg-primary rounded-full wave-bar"
          style={{
            height: `${10 + Math.random() * 16}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}
