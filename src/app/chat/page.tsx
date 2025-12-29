import ChatForm from "./ChatForm";

export default async function chatPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Chat Application
        </h1>
        <ChatForm />
      </div>
    </div>
  );
}
