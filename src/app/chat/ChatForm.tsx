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
  const lastScrollTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);

    // Set cookie for server-side access
    if (storedNickname) {
      document.cookie = `chatNickname=${storedNickname}; path=/; max-age=31536000`;
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [messages.length, isLoading]);

  // Dispatch event when messages change to update ClearButton
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("messagesChanged", {
        detail: messages.length > 0,
      })
    );
  }, [messages.length]);

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

    // Scroll immediately when user message is added
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

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

    // Scroll immediately when assistant loader appears
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

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
          // Scroll during streaming to keep up with new content (throttled)
          const now = Date.now();
          if (now - lastScrollTimeRef.current > 100) {
            lastScrollTimeRef.current = now;
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            });
          }
        }
      }

      // Final scroll to ensure complete message is visible
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);

      setIsLoading(false);

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
    <>
      {/* Messages display - scrolls with main window */}
      <div className="p-4">
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
            <div className="h-36" ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                Welcome to Roman History Chat
              </h2>
              <p className="text-muted-foreground">
                Ask me anything about ancient Rome, its emperors, battles,
                culture, and more!
              </p>
            </div>

            {/* Prompt Suggestions */}
            <div className="w-full max-w-2xl space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Try asking about:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Tell me about Julius Caesar",
                  "What was the Colosseum used for?",
                  "Explain the fall of the Roman Empire",
                  "Who were the Roman gods?",
                  "Describe the Punic Wars",
                  "What was life like in ancient Rome?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field - positioned under suggestions when chat is empty */}
            <div className="w-full max-w-2xl mt-6">
              <div className="bg-background rounded-2xl shadow-lg border p-4">
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about Roman history..."
                      required
                      disabled={isLoading}
                      className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input field - fixed at bottom when messages exist */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pb-4 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-background rounded-2xl shadow-lg border p-4">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    required
                    disabled={isLoading}
                    className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
