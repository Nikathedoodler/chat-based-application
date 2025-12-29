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

    // System prompt to restrict LLM to Roman history only
    const systemPrompt = `You are a helpful assistant specialized exclusively in Roman history. 
Your role is to answer questions about:
- Ancient Rome, the Roman Empire, Roman Republic
- Roman emperors, senators, generals, and historical figures
- Roman culture, society, military, architecture, law, and politics
- Roman conquests, battles, and wars
- Roman mythology and religion
- The fall of the Roman Empire
- Any topic related to ancient Roman civilization

For any question that is NOT about Roman history, you must politely decline and explain that you can only answer questions about Roman history. Be friendly and helpful, but firm in your limitation.

Example responses for non-Roman history questions:
- "I'm sorry, but I can only answer questions about Roman history. Could you ask me something about ancient Rome instead?"
- "I specialize exclusively in Roman history. Please ask me about the Roman Empire, Roman culture, or any aspect of ancient Roman civilization."

Always be polite, helpful, and enthusiastic when answering questions about Roman history.`;

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
