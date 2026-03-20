import { useState } from "react";
import { register, login } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Props = {
  onAuth: () => void;
};

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const r = mode === "login"
      ? await login(email, password)
      : await register(name, email, password);

    setLoading(false);

    if (r.ok) {
      onAuth();
    } else {
      setError(r.data?.error || "Что-то пошло не так");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background bg-mesh overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "#a855f7" }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-8 blur-3xl" style={{ background: "#22d3ee" }} />
      </div>

      <div className="w-full max-w-sm mx-4 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl msg-gradient flex items-center justify-center mx-auto mb-4 neon-glow-purple">
            <span className="text-white font-golos font-black text-2xl">Ф</span>
          </div>
          <h1 className="font-golos font-black text-3xl text-foreground tracking-tight">ФРАСЕ</h1>
          <p className="text-muted-foreground text-sm mt-1">Мессенджер нового поколения</p>
        </div>

        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex rounded-xl bg-secondary/50 p-1 gap-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <Field
                icon="User"
                placeholder="Ваше имя"
                value={name}
                onChange={setName}
                type="text"
                autoFocus
              />
            )}
            <Field
              icon="Mail"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoFocus={mode === "login"}
            />
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Icon name="Lock" size={15} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-secondary/60 rounded-xl pl-9 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2 animate-fade-in">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl msg-gradient text-white font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 neon-glow-purple mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {mode === "login" ? "Входим..." : "Регистрируем..."}
                </span>
              ) : (
                mode === "login" ? "Войти в ФРАСЕ" : "Создать аккаунт"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login" ? "Ещё нет аккаунта?" : "Уже есть аккаунт?"}
            {" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon, placeholder, value, onChange, type, autoFocus,
}: {
  icon: string; placeholder: string; value: string;
  onChange: (v: string) => void; type: string; autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Icon name={icon} size={15} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoFocus={autoFocus}
        className="w-full bg-secondary/60 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
    </div>
  );
}
