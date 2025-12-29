"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatFormProps {
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export default function ChatForm({ initialMessages = [] }: ChatFormProps) {
  const [nickname, setNickname] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulsingMessageIndex, setPulsingMessageIndex] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);

    // Set cookie for server-side access
    if (storedNickname) {
      document.cookie = `chatNickname=${storedNickname}; path=/; max-age=31536000`;
    }

    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

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

    const assistantMessage: Message = { role: "assistant", content: "" };
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

          if (line.startsWith("0:")) {
            const text = line.slice(2);
            accumulatedContent += text;
            setMessages([
              ...newMessages,
              { role: "assistant", content: accumulatedContent },
            ]);
          } else {
            accumulatedContent += line;
            setMessages([
              ...newMessages,
              { role: "assistant", content: accumulatedContent },
            ]);
          }
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
      <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Enter Your Nickname
        </h2>
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
            }
          }}
        >
          <input
            name="nickname"
            placeholder="Enter your nickname"
            required
            style={{
              width: "100%",
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
            autoFocus
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: "16px", flexShrink: 0 }}>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Logged in as: <span style={{ fontWeight: "600" }}>{nickname}</span>
        </p>
      </div>

      {/* Messages display */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "24px",
          minHeight: 0,
        }}
      >
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    background: message.role === "user" ? "#2563eb" : "#e5e7eb",
                    color: message.role === "user" ? "white" : "#111",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    animation:
                      message.role === "assistant" &&
                      ((isLoading && index === messages.length - 1) ||
                        pulsingMessageIndex === index)
                        ? "pulse 2s ease-in-out infinite"
                        : "none",
                  }}
                >
                  {message.content ||
                    (isLoading && index === messages.length - 1 ? "..." : "")}
                  {message.role === "assistant" &&
                    isLoading &&
                    index === messages.length - 1 && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          background: "#666",
                          borderRadius: "50%",
                          marginLeft: "4px",
                          animation: "blink 1s infinite",
                        }}
                      />
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
            }}
          >
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>

      {/* Chat form */}
      <form onSubmit={handleSubmit} style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            required
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "8px 24px",
              background: isLoading ? "#9ca3af" : "#2563eb",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c00",
            }}
          >
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
