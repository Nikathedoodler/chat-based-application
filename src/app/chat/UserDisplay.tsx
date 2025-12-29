"use client";

import { useEffect, useState } from "react";

export default function UserDisplay() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);

    // Listen for nickname changes
    const handleStorageChange = () => {
      const newNickname = localStorage.getItem("chatNickname");
      setNickname(newNickname);
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setNickname(customEvent.detail);
      } else {
        handleStorageChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("nicknameChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("nicknameChanged", handleCustomEvent);
    };
  }, []);

  if (!mounted || !nickname) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground">
      Logged in as:{" "}
      <span className="font-semibold text-foreground">{nickname}</span>
    </div>
  );
}
