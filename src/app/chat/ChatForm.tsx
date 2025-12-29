"use client";

import { useActionState, useEffect, useState } from "react";
import { sendMessage } from "./actions";

export default function ChatForm() {
  const [state, formAction] = useActionState(sendMessage, {
    error: null,
    success: false,
  });
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);
  }, []);

  if (!nickname) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="mb-4">
          <p className="text-sm text-base-content/70">
            Logged in as: <span className="font-semibold">{nickname}</span>
          </p>
        </div>
        <form action={formAction}>
          <div className="flex gap-2">
            <input
              name="message"
              placeholder="Type a message..."
              required
              className="input input-bordered flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </div>
          {state?.error && (
            <div className="alert alert-error mt-4">
              <span>{state.error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
