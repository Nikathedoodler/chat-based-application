"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

interface ChatFormProps {
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export default function ChatForm({ initialMessages = [] }: ChatFormProps) {
  const [nickname, setNickname] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((msg, idx) => ({
      ...msg,
      id: `msg-${idx}-${Date.now()}`,
    }))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulsingMessageIndex, setPulsingMessageIndex] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);

    // Set cookie for server-side access
    if (storedNickname) {
      document.cookie = `chatNickname=${storedNickname}; path=/; max-age=31536000`;
    }
  }, []);

  // Auto-scroll to bottom when messages change - similar to AI SDK's built-in scroll
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages.length, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      id: `user-${Date.now()}`,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    // Save user message to storage
    if (nickname) {
      await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          role: "user",
          content: input.trim(),
        }),
      });
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: `assistant-${Date.now()}`,
    };
    setMessages([...newMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;
          const text = line.startsWith("0:") ? line.slice(2) : line;
          accumulatedContent += text;
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: accumulatedContent,
              id: assistantMessage.id,
            },
          ]);
        }
      }

      setIsLoading(false);

      // Save assistant response to storage
      if (nickname && accumulatedContent) {
        await fetch("/api/save-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname,
            role: "assistant",
            content: accumulatedContent,
          }),
        });
      }

      const finalMessageIndex = newMessages.length;
      setPulsingMessageIndex(finalMessageIndex);
      setTimeout(() => {
        setPulsingMessageIndex(null);
      }, 3000);
    } catch (err) {
      console.error("Streaming error:", err);
      setError("Failed to get response from AI");
      setIsLoading(false);
      setMessages(newMessages);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!nickname) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Nickname</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newNickname = formData.get("nickname");
              if (typeof newNickname === "string" && newNickname.trim()) {
                const trimmedNickname = newNickname.trim();
                localStorage.setItem("chatNickname", trimmedNickname);
                document.cookie = `chatNickname=${trimmedNickname}; path=/; max-age=31536000`;
                setNickname(trimmedNickname);
                // Dispatch custom event to update UserDisplay
                window.dispatchEvent(
                  new CustomEvent("nicknameChanged", {
                    detail: trimmedNickname,
                  })
                );
              }
            }}
            className="space-y-4"
          >
            <Input
              name="nickname"
              placeholder="Enter your nickname"
              required
              autoFocus
            />
            <Button type="submit" className="w-full">
              Join Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Messages display */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto mb-6 min-h-0"
        >
          {messages.length > 0 ? (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={cn(
                    "flex mb-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                      message.role === "assistant" &&
                        ((isLoading && index === messages.length - 1) ||
                          pulsingMessageIndex === index) &&
                        "animate-pulse-custom"
                    )}
                  >
                    {message.content ||
                      (isLoading && index === messages.length - 1 ? "..." : "")}
                    {message.role === "assistant" &&
                      isLoading &&
                      index === messages.length - 1 && (
                        <span className="inline-block w-2 h-2 bg-muted-foreground/50 rounded-full ml-1 animate-blink" />
                      )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>

        {/* Chat form */}
        <form onSubmit={handleSubmit} className="flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              required
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
