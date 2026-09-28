import { useState } from "react";
import { ChatPage } from "./pages/chat-page";
import { LoginPage } from "./pages/login-page";
import type { Session } from "./types/session";

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  return session ? (
    <ChatPage session={session} onLogout={() => setSession(null)} />
  ) : (
    <LoginPage onConnect={setSession} />
  );
};

export default App;
