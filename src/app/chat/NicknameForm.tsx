"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NicknameForm() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if nickname already exists in localStorage
    const storedNickname = localStorage.getItem("chatNickname");
    if (storedNickname) {
      router.refresh();
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      localStorage.setItem("chatNickname", nickname.trim());
      router.refresh();
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Welcome to Chat!</h2>
          <p className="mb-4">Please enter your nickname to join the chat.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input input-bordered w-full mb-4"
              required
              autoFocus
            />
            <button type="submit" className="btn btn-primary w-full">
              Join Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

