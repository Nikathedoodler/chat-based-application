# Chat Application

A chat app built with Next.js where you can talk to an AI assistant about Roman history. It streams responses in real-time and saves your conversation history.

## Setup

You'll need Node.js installed and an OpenAI API key.

1. Clone the repo and install:

```bash
npm install
```

2. Create `.env.local` in the root:

```env
OPENAI_API_KEY=your_key_here
```

3. Run it:

```bash
npm run dev
```

Then open http://localhost:3000

## How to Test

### Basic Flow

1. Go to `/chat` - you'll be asked for a nickname
2. Enter a nickname and start chatting
3. Messages stream in real-time (you'll see text appearing word by word)
4. Try refreshing - your chat history should come back

### The Roman History Thing

The AI is locked to only answer questions about Roman history. Here's what to try:

**Should work:**

- "Tell me about Julius Caesar"
- "What happened during the fall of Rome?"
- "Who was Augustus?"

**Should politely decline:**

- "What's the weather like?"
- "Explain quantum physics"
- "Tell me about modern Italy"

When you ask non-Roman history stuff, it should say something like "I can only answer questions about Roman history" and suggest asking about Rome instead.

### What to Look For

**Streaming:** When you send a message, the response should appear gradually, not all at once. You should see text appearing word by word.

**Pulse Animation:** New AI responses have a subtle pulsing animation that lasts a few seconds - this draws your eye to the new message.

**Auto-scroll:** When a new message comes in, the chat should automatically scroll down so you can see it.

**History:** Send a few messages, then refresh the page. Everything should come back - this is stored server-side in `.chat-history/` folder.

**UI:** The chat takes up the full height of the screen, messages are in bubbles (blue for you, gray for AI), and it should feel pretty smooth.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Vercel AI SDK for streaming
- OpenAI API
- Tailwind CSS + DaisyUI (configured but using inline styles mostly)
- File-based storage for chat history

## Project Structure

- `src/app/chat/page.tsx` - Main chat page, loads history server-side
- `src/app/chat/ChatForm.tsx` - The chat UI component with streaming
- `src/app/api/chat/route.ts` - API endpoint that handles streaming
- `src/lib/chat-storage.ts` - Saves/loads chat history to files
- `src/app/api/save-message/route.ts` - Saves individual messages

## Notes

- Chat history is saved in `.chat-history/` folder (one JSON file per user)
- Nickname is stored in localStorage on the client
- The system prompt restricts the AI to Roman history topics
- Streaming uses Server-Sent Events (SSE)
- Previous messages are rendered server-side on page load

## If Something Breaks

**"Cannot find module" errors:** Run `npm install` again

**API not working:** Check your `.env.local` file has the OpenAI key set correctly

**No chat history:** Make sure the `.chat-history/` folder can be created/written to

**Streaming not working:** Check the browser console and network tab - should see `text/event-stream` responses

## Build

```bash
npm run build
npm start
```

That's it! The app should work out of the box once you have the API key set up.
