import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import ContactsPanel from "@/components/ContactsPanel";
import ProfilePanel from "@/components/ProfilePanel";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationsPanel from "@/components/NotificationsPanel";
import MediaPanel from "@/components/MediaPanel";
import CallOverlay from "@/components/CallOverlay";
import type { User, Conversation, ChatMessage, ContactUser } from "@/lib/api";
import { getConversations, getMessages, sendMessage, listUsers, pingOnline } from "@/lib/api";

export type Section = "chats" | "contacts" | "profile" | "settings" | "notifications" | "media";

type Props = {
  currentUser: User;
  onLogout: () => void;
};

export default function Index({ currentUser, onLogout }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<ContactUser[]>([]);
  const [calling, setCalling] = useState(false);
  const [callContact, setCallContact] = useState<ContactUser | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const loadConversations = useCallback(async () => {
    const convs = await getConversations();
    setConversations(convs);
  }, []);

  const loadUsers = useCallback(async () => {
    const users = await listUsers();
    setAllUsers(users);
  }, []);

  useEffect(() => {
    loadConversations();
    loadUsers();
    pingOnline();
    const interval = setInterval(loadConversations, 5000);
    const pingInterval = setInterval(pingOnline, 30000);
    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, [loadConversations, loadUsers]);

  const handleSelectConv = async (conv: Conversation) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    const msgs = await getMessages(conv.user.id);
    setMessages(msgs);
    setLoadingMsgs(false);
  };

  const handleOpenChat = async (user: ContactUser) => {
    const existing = conversations.find((c) => c.user.id === user.id);
    if (existing) {
      setActiveSection("chats");
      handleSelectConv(existing);
      return;
    }
    const fake: Conversation = {
      conversation_id: 0,
      user,
      last_message: "",
      time: "",
      unread: 0,
    };
    setActiveConv(fake);
    setMessages([]);
    setActiveSection("chats");
  };

  const handleSend = async (text: string, type: "text" | "voice" = "text", duration?: string) => {
    if (!activeConv) return;
    const msg = await sendMessage(activeConv.user.id, text, type, duration);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      await loadConversations();
    }
  };

  const pollMessages = useCallback(async () => {
    if (!activeConv) return;
    const msgs = await getMessages(activeConv.user.id);
    setMessages(msgs);
  }, [activeConv]);

  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(pollMessages, 4000);
    return () => clearInterval(interval);
  }, [pollMessages, activeConv]);

  const handleMessageDeleted = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, deleted: true, text: "" } : m))
    );
  };

  const handleCall = (user: ContactUser) => {
    setCallContact(user);
    setCalling(true);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background bg-mesh">
      {calling && callContact && (
        <CallOverlay contact={callContact} onEnd={() => setCalling(false)} />
      )}

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} currentUser={currentUser} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        {activeSection === "chats" && (
          <>
            <ChatList
              conversations={conversations}
              activeConv={activeConv}
              onSelectConv={handleSelectConv}
              allUsers={allUsers}
              onOpenChat={handleOpenChat}
            />
            <ChatWindow
              conv={activeConv}
              messages={messages}
              loading={loadingMsgs}
              onSend={handleSend}
              onCall={handleCall}
              onMessageDeleted={handleMessageDeleted}
            />
          </>
        )}
        {activeSection === "contacts" && <ContactsPanel users={allUsers} onOpenChat={handleOpenChat} onCall={handleCall} />}
        {activeSection === "profile" && (
          <ProfilePanel
            user={currentUser}
            onAvatarChange={(av) => {
              currentUser.avatar = av;
            }}
          />
        )}
        {activeSection === "settings" && <SettingsPanel onLogout={onLogout} />}
        {activeSection === "notifications" && <NotificationsPanel />}
        {activeSection === "media" && <MediaPanel />}
      </div>
    </div>
  );
}