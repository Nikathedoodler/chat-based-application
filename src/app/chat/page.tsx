import ChatForm from "./ChatForm";
import UserDisplay from "./UserDisplay";
import ClearButton from "./ClearButton";
import LogoutButton from "./LogoutButton";
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
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-2">
              Chat Application - Roman History
            </h1>
            <div className="flex justify-between items-center">
              <UserDisplay />
              <div className="flex items-center gap-2">
                <ClearButton hasMessages={initialMessages.length > 0} />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-0">
        <div className="max-w-7xl mx-auto">
          <ChatForm initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
