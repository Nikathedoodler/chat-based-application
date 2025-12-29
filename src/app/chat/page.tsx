import ChatForm from "./ChatForm";
import UserDisplay from "./UserDisplay";
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
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-2">
              Chat Application
            </h1>
            <div className="flex justify-center">
              <UserDisplay />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area with padding for fixed header */}
      <div className="pt-32 pb-4 flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4">
          <ChatForm initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
