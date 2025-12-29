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
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Chat Application
        </h1>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatForm initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
