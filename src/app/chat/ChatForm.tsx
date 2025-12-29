"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { sendMessage } from "./actions";

export default function ChatForm() {
  const [state, formAction] = useActionState(sendMessage, {
    error: null,
    success: false,
  });
  const [nickname, setNickname] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);
  }, []);

  // Clear input after successful submission
  useEffect(() => {
    if (state?.success && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [state?.success]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show nickname input if no nickname exists
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
              localStorage.setItem("chatNickname", newNickname.trim());
              setNickname(newNickname.trim());
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
        padding: "24px",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Logged in as: <span style={{ fontWeight: "600" }}>{nickname}</span>
        </p>
      </div>
      <form
        action={formAction}
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          const message = formData.get("message");
          if (typeof message === "string") {
            setLastUserMessage(message);
          }
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            ref={inputRef}
            name="message"
            placeholder="Type a message..."
            required
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 24px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
        {state?.error && (
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
            <span>{state.error}</span>
          </div>
        )}
      </form>

      {lastUserMessage && (
        <div style={{ marginTop: "24px" }}>
          {/* User message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                background: "#2563eb",
                color: "white",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              {lastUserMessage}
            </div>
          </div>

          {/* AI response */}
          {state?.response && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  maxWidth: "70%",
                  background: "#e5e7eb",
                  color: "#111",
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
              >
                {state.response}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
