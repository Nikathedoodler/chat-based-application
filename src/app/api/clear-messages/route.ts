import { clearChatHistory } from "@/lib/chat-storage";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nickname } = await req.json();

    if (!nickname) {
      return new Response(
        JSON.stringify({ error: "Missing nickname" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await clearChatHistory(nickname);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error clearing messages:", error);
    return new Response(
      JSON.stringify({ error: "Failed to clear messages" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

