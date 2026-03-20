import { useState, useEffect } from "react";
import type { ContactUser } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Props = {
  contact: ContactUser;
  onEnd: () => void;
};

export default function CallOverlay({ contact, onEnd }: Props) {
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnected(true), 1800);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [connected]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)" }}>
      <div className="relative flex flex-col items-center gap-6 animate-scale-in">
        <div className="absolute -inset-24 rounded-full opacity-20 animate-pulse-glow" style={{ background: `radial-gradient(circle, ${contact.color}66, transparent 70%)` }} />

        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center text-3xl font-bold relative z-10 neon-glow-purple"
          style={{ background: contact.color + "33", border: `2px solid ${contact.color}66`, color: contact.color }}
        >
          {contact.avatar}
        </div>

        <div className="text-center z-10">
          <h2 className="font-golos font-bold text-2xl text-foreground">{contact.name}</h2>
          <p className="text-sm mt-1" style={{ color: connected ? "#10b981" : "#a855f7" }}>
            {connected ? fmt(secs) : "Вызов..."}
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          <CallBtn icon={muted ? "MicOff" : "Mic"} label={muted ? "Вкл. микрофон" : "Выкл. микрофон"} active={muted} color="#6366f1" onClick={() => setMuted(!muted)} />
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center transition-all hover:scale-110 hover:bg-destructive/80 shadow-lg"
            style={{ boxShadow: "0 0 30px rgba(239,68,68,0.5)" }}
          >
            <Icon name="PhoneOff" size={24} className="text-white" />
          </button>
          <CallBtn icon={speaker ? "Volume2" : "VolumeX"} label="Динамик" active={!speaker} color="#22d3ee" onClick={() => setSpeaker(!speaker)} />
        </div>
      </div>
    </div>
  );
}

function CallBtn({ icon, label, active, color, onClick }: { icon: string; label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
      style={{
        background: active ? color + "33" : "rgba(255,255,255,0.08)",
        border: `1px solid ${active ? color + "66" : "rgba(255,255,255,0.12)"}`,
        color: active ? color : "#94a3b8"
      }}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}