import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import ContactsPanel from "@/components/ContactsPanel";
import ProfilePanel from "@/components/ProfilePanel";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationsPanel from "@/components/NotificationsPanel";
import MediaPanel from "@/components/MediaPanel";
import CallOverlay from "@/components/CallOverlay";

export type Section = "chats" | "contacts" | "profile" | "settings" | "notifications" | "media";

export type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  color: string;
};

export type Message = {
  id: number;
  text: string;
  time: string;
  mine: boolean;
  type: "text" | "voice";
  duration?: string;
};

const CHATS: Chat[] = [
  { id: 1, name: "Алиса Новикова", avatar: "АН", lastMessage: "Окей, буду в 18:00!", time: "18:42", unread: 3, online: true, color: "#a855f7" },
  { id: 2, name: "Команда ФРАСЕ", avatar: "КФ", lastMessage: "Новый дизайн выглядит 🔥", time: "17:55", unread: 12, online: true, color: "#22d3ee" },
  { id: 3, name: "Максим Орлов", avatar: "МО", lastMessage: "Голосовое сообщение · 0:32", time: "16:30", unread: 0, online: false, color: "#ec4899" },
  { id: 4, name: "Катя Светлова", avatar: "КС", lastMessage: "Посмотри файлы в медиа", time: "14:10", unread: 1, online: true, color: "#10b981" },
  { id: 5, name: "Игорь Данилов", avatar: "ИД", lastMessage: "Созвонимся завтра?", time: "12:05", unread: 0, online: false, color: "#f59e0b" },
  { id: 6, name: "Sophia Chen", avatar: "SC", lastMessage: "Thanks, got it!", time: "вчера", unread: 0, online: true, color: "#6366f1" },
];

const MESSAGES: Message[] = [
  { id: 1, text: "Привет! Как дела?", time: "18:01", mine: false, type: "text" },
  { id: 2, text: "Отлично! Работаем над новым проектом 🚀", time: "18:03", mine: true, type: "text" },
  { id: 3, text: "", time: "18:15", mine: false, type: "voice", duration: "0:24" },
  { id: 4, text: "Звучит интересно! Покажешь потом?", time: "18:20", mine: false, type: "text" },
  { id: 5, text: "Конечно! Уже почти готово. Встретимся сегодня?", time: "18:35", mine: true, type: "text" },
  { id: 6, text: "Окей, буду в 18:00!", time: "18:42", mine: false, type: "text" },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(CHATS[0]);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [calling, setCalling] = useState(false);
  const [callContact, setCallContact] = useState<Chat | null>(null);

  const handleCall = (chat: Chat) => {
    setCallContact(chat);
    setCalling(true);
  };

  const handleSendMessage = (text: string, type: "text" | "voice" = "text", duration?: string) => {
    const newMsg: Message = {
      id: messages.length + 1,
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
      type,
      duration,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background bg-mesh">
      {calling && callContact && (
        <CallOverlay contact={callContact} onEnd={() => setCalling(false)} />
      )}

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex flex-1 overflow-hidden">
        {activeSection === "chats" && (
          <>
            <ChatList
              chats={CHATS}
              activeChat={activeChat}
              onSelectChat={setActiveChat}
            />
            <ChatWindow
              chat={activeChat}
              messages={messages}
              onSend={handleSendMessage}
              onCall={handleCall}
            />
          </>
        )}
        {activeSection === "contacts" && <ContactsPanel chats={CHATS} onCall={handleCall} />}
        {activeSection === "profile" && <ProfilePanel />}
        {activeSection === "settings" && <SettingsPanel />}
        {activeSection === "notifications" && <NotificationsPanel />}
        {activeSection === "media" && <MediaPanel />}
      </div>
    </div>
  );
}
