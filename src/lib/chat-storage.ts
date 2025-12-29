import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { sanitizeNickname } from "./utils";

const STORAGE_DIR = join(process.cwd(), ".chat-history");

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatHistory {
  nickname: string;
  messages: Message[];
  lastUpdated: number;
}

// Ensure storage directory exists
async function ensureStorageDir() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Get file path for a user's chat history
function getHistoryPath(nickname: string): string {
  const sanitized = sanitizeNickname(nickname);
  return join(STORAGE_DIR, `${sanitized}.json`);
}

// Load chat history for a user
export async function loadChatHistory(nickname: string): Promise<Message[]> {
  try {
    await ensureStorageDir();
    const filePath = getHistoryPath(nickname);

    if (!existsSync(filePath)) {
      return [];
    }

    const fileContent = await readFile(filePath, "utf-8");
    const history: ChatHistory = JSON.parse(fileContent);
    return history.messages || [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
}

// Save a new message to chat history
export async function saveMessage(
  nickname: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = getHistoryPath(nickname);

    // Load existing history
    let history: ChatHistory = {
      nickname,
      messages: [],
      lastUpdated: Date.now(),
    };

    if (existsSync(filePath)) {
      const fileContent = await readFile(filePath, "utf-8");
      history = JSON.parse(fileContent);
    }

    // Add new message
    history.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    history.lastUpdated = Date.now();

    // Save back to file
    await writeFile(filePath, JSON.stringify(history, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

// Save multiple messages at once
export async function saveMessages(
  nickname: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = getHistoryPath(nickname);

    const history: ChatHistory = {
      nickname,
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: Date.now(),
      })),
      lastUpdated: Date.now(),
    };

    await writeFile(filePath, JSON.stringify(history, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving messages:", error);
  }
}

// Clear chat history for a user
export async function clearChatHistory(nickname: string): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = getHistoryPath(nickname);

    if (existsSync(filePath)) {
      // Create empty history
      const history: ChatHistory = {
        nickname,
        messages: [],
        lastUpdated: Date.now(),
      };

      await writeFile(filePath, JSON.stringify(history, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
}
