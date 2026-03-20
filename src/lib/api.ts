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

const CHATS_URL = "https://functions.poehali.dev/2a61556e-691d-4a82-ab71-db8e7653883c";

async function callChats(action: string, method: string, params?: Record<string, string>, body?: object) {
  const token = getToken();
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${CHATS_URL}?${qs}`, {
    method,
    headers: { "Content-Type": "application/json", "X-Auth-Token": token },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export type ContactUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  color: string;
  online: boolean;
  last_seen?: string | null;
};

export type Conversation = {
  conversation_id: number;
  user: ContactUser;
  last_message: string;
  time: string;
  unread: number;
};

export type ChatMessage = {
  id: number;
  sender_id: number;
  mine: boolean;
  text: string;
  type: "text" | "voice";
  duration?: string;
  time: string;
  deleted?: boolean;
};

export async function listUsers(): Promise<ContactUser[]> {
  const r = await callChats("list_users", "GET");
  return r.ok ? r.data.users : [];
}

export async function getConversations(): Promise<Conversation[]> {
  const r = await callChats("conversations", "GET");
  return r.ok ? r.data.conversations : [];
}

export async function getMessages(withUserId: number): Promise<ChatMessage[]> {
  const r = await callChats("messages", "GET", { with_user_id: String(withUserId) });
  return r.ok ? r.data.messages : [];
}

export async function sendMessage(toUserId: number, text: string, type: "text" | "voice" = "text", duration?: string): Promise<ChatMessage | null> {
  const r = await callChats("send", "POST", {}, { to_user_id: toUserId, text, type, duration });
  return r.ok ? r.data.message : null;
}

export async function deleteMessage(messageId: number): Promise<boolean> {
  const r = await callChats("delete_message", "POST", {}, { message_id: messageId });
  return r.ok;
}

export async function updateAvatar(avatar: string): Promise<boolean> {
  const r = await callChats("update_avatar", "POST", {}, { avatar });
  return r.ok;
}

export async function pingOnline(): Promise<void> {
  await callChats("ping", "POST", {}, {});
}

export { getToken, clearToken };