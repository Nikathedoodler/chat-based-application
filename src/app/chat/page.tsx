import { sendMessage } from "./actions";
import { redirect } from "next/navigation";
import ChatForm from "./ChatForm";

export default async function chatPage() {
  return (
    <div>
      <h1 className="max-w-md mx-auto p-6">Chat app</h1>
      <form action={sendMessage} className="text-2xl font-bold mb-6">
        <ChatForm />
      </form>
    </div>
  );
}
