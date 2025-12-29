"use server";

import { revalidatePath } from "next/cache";
import {OpenAI} from "openai";

const openai = new OpenAI({
  apiKey: process.env.CHAT_API_KEY,
});

export async function sendMessage(presState: any, formData: FormData) {
  const message = formData.get("message");

  const user = "Nika";

  // Convert message to string if it exists and is not a File
  let messageText: string | undefined;
  if (typeof message === 'string') {
    messageText = message;
  }

  if (!messageText?.trim()) {
    return { error: "Message can not be empty" };
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: "user", content: messageText }],
      stream: true
    });

    let apiResponse = '';
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        apiResponse += chunk.choices[0].delta.content;
      }
    }

    revalidatePath('/chat');
    return { success: true, response: apiResponse };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return { error: 'Failed to get response from AI' };
  }
}
