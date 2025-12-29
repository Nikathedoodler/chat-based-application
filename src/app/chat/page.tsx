import ChatForm from "./ChatForm";
import { loadChatHistory } from "@/lib/chat-storage";
import { cookies } from "next/headers";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const nickname = cookieStore.get("chatNickname")?.value;

  let initialMessages: Array<{ role: "user" | "assistant"; content: string }> =
    [];
  if (nickname) {
    const history = await loadChatHistory(nickname);
    initialMessages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "16px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Chat Application
        </h1>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <ChatForm initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
