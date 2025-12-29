import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages cannot be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a helpful assistant specialized in Roman history. Answer questions about ancient Rome, the Roman Empire, Roman Republic, emperors, culture, military, architecture, law, politics, battles, mythology, and the fall of the empire.

For questions not about Roman history, politely decline and explain you can only answer questions about Roman history.`;

    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesWithSystem,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
