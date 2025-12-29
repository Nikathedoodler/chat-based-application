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
        model: 'gpt-40-mini',
        message: [{role: "user", content: message}],
        stream: true
    })

    let apiResponse = ''
    for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
            apiResonse += chunk.choices[0].delta.content
        }
    }
  } 


  return { success: true };
}
