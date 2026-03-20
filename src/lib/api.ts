const AUTH_URL = "https://functions.poehali.dev/3de4acc7-8ee3-4008-aca4-03db6467e60b";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  color: string;
};

function getToken(): string {
  return localStorage.getItem("frase_token") || "";
}

function setToken(token: string) {
  localStorage.setItem("frase_token", token);
}

function clearToken() {
  localStorage.removeItem("frase_token");
}

async function callAuth(action: string, method: string, body?: object, withToken = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withToken) headers["X-Auth-Token"] = getToken();

  const res = await fetch(`${AUTH_URL}?action=${action}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function register(name: string, email: string, password: string) {
  const r = await callAuth("register", "POST", { name, email, password });
  if (r.ok) setToken(r.data.token);
  return r;
}

export async function login(email: string, password: string) {
  const r = await callAuth("login", "POST", { email, password });
  if (r.ok) setToken(r.data.token);
  return r;
}

export async function getMe(): Promise<User | null> {
  if (!getToken()) return null;
  const r = await callAuth("me", "GET", undefined, true);
  if (r.ok) return r.data.user as User;
  clearToken();
  return null;
}

export async function logout() {
  await callAuth("logout", "POST", undefined, true);
  clearToken();
}

export { getToken, clearToken };
