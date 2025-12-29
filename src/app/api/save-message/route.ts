import { saveMessage } from "@/lib/chat-storage";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nickname, role, content } = await req.json();

    if (!nickname || !role || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (role !== "user" && role !== "assistant") {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await saveMessage(nickname, role, content);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

