"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedNickname = localStorage.getItem("chatNickname");
    setNickname(storedNickname);

    // Listen for nickname changes
    const handleNicknameChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setNickname(customEvent.detail);
      } else {
        const newNickname = localStorage.getItem("chatNickname");
        setNickname(newNickname);
      }
    };

    window.addEventListener("nicknameChanged", handleNicknameChange);
    window.addEventListener("storage", handleNicknameChange);

    return () => {
      window.removeEventListener("nicknameChanged", handleNicknameChange);
      window.removeEventListener("storage", handleNicknameChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("chatNickname");

    document.cookie = "chatNickname=; path=/; max-age=0";

    window.dispatchEvent(
      new CustomEvent("nicknameChanged", {
        detail: null,
      })
    );

    router.push("/");
  };

  if (!mounted || !nickname) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );
}
