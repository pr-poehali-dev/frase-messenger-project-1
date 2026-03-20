import { useState } from "react";
import Icon from "@/components/ui/icon";

const TABS = ["Фото", "Видео", "Файлы", "Ссылки"];

const COLORS = ["#a855f7", "#22d3ee", "#ec4899", "#10b981", "#f59e0b", "#6366f1", "#a855f7", "#22d3ee", "#10b981"];
const GRADIENTS = [
  "linear-gradient(135deg, #a855f7, #6366f1)",
  "linear-gradient(135deg, #22d3ee, #0ea5e9)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #a855f7, #ec4899)",
  "linear-gradient(135deg, #22d3ee, #10b981)",
  "linear-gradient(135deg, #f59e0b, #a855f7)",
];

const FILES = [
  { name: "презентация_финал.pdf", size: "4.2 МБ", icon: "FileText", color: "#ef4444", from: "Алиса Новикова", date: "сегодня" },
  { name: "бюджет_2026.xlsx", size: "1.8 МБ", icon: "FileSpreadsheet", color: "#10b981", from: "Команда ФРАСЕ", date: "вчера" },
  { name: "design_v3.fig", size: "28 МБ", icon: "Figma", color: "#a855f7", from: "Катя Светлова", date: "20 март" },
  { name: "contract.docx", size: "0.3 МБ", icon: "FileText", color: "#6366f1", from: "Игорь Данилов", date: "15 март" },
];

export default function MediaPanel() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-golos font-bold text-xl text-foreground mb-4">Медиа</h1>
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === i
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        {(activeTab === 0 || activeTab === 1) && (
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {GRADIENTS.map((g, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl cursor-pointer hover:scale-105 hover:shadow-lg transition-all animate-fade-in group relative overflow-hidden"
                  style={{ background: g, animationDelay: `${i * 40}ms` }}
                >
                  {activeTab === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Icon name="Play" size={20} className="text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-md bg-black/50 flex items-center justify-center">
                      <Icon name="Download" size={10} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">Всего: {GRADIENTS.length} файлов · 148 МБ</p>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-2 max-w-2xl">
            {FILES.map((f, i) => (
              <div
                key={i}
                className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.color + "22" }}>
                  <Icon name={f.icon} size={18} style={{ color: f.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.size} · от {f.from} · {f.date}</div>
                </div>
                <button className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:text-primary flex items-center justify-center transition-colors">
                  <Icon name="Download" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-2 max-w-2xl">
            {[
              { url: "figma.com/design/abc123", from: "Катя Светлова", time: "сегодня", color: "#a855f7" },
              { url: "notion.so/project-brief", from: "Команда ФРАСЕ", time: "вчера", color: "#22d3ee" },
              { url: "github.com/frase/app", from: "Алиса Новикова", time: "19 март", color: "#10b981" },
            ].map((l, i) => (
              <div
                key={i}
                className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-fade-in hover:border-primary/30 transition-all cursor-pointer"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: l.color + "22" }}>
                  <Icon name="Link" size={16} style={{ color: l.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">{l.url}</div>
                  <div className="text-xs text-muted-foreground">от {l.from} · {l.time}</div>
                </div>
                <Icon name="ExternalLink" size={14} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
