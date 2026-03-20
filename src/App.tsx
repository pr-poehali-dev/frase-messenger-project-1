
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthScreen from "./components/AuthScreen";
import { getMe } from "./lib/api";
import type { User } from "./lib/api";

const queryClient = new QueryClient();

function AppInner() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  if (user === undefined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-2xl msg-gradient animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={() => getMe().then(setUser)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index currentUser={user} onLogout={() => setUser(null)} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;