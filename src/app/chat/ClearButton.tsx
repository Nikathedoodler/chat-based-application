"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClearButtonProps {
  hasMessages?: boolean;
}

export default function ClearButton({
  hasMessages: initialHasMessages = false,
}: ClearButtonProps) {
  const [nickname, setNickname] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasMessages, setHasMessages] = useState(initialHasMessages);
  const [error, setError] = useState<string | null>(null);

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

    // Listen for messages changes
    const handleMessagesChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        setHasMessages(customEvent.detail);
      }
    };

    window.addEventListener("nicknameChanged", handleNicknameChange);
    window.addEventListener("storage", handleNicknameChange);
    window.addEventListener("messagesChanged", handleMessagesChange);

    return () => {
      window.removeEventListener("nicknameChanged", handleNicknameChange);
      window.removeEventListener("storage", handleNicknameChange);
      window.removeEventListener("messagesChanged", handleMessagesChange);
    };
  }, []);

  const handleClear = async () => {
    if (!nickname || isClearing) return;

    setIsClearing(true);
    setError(null);
    try {
      const response = await fetch("/api/clear-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear messages");
      }

      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error clearing messages:", err);
      setIsClearing(false);
      setError("Failed to clear messages. Please try again.");
    }
  };

  if (!mounted || !nickname || !hasMessages) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-500 text-white hover:bg-red-600 border-red-500"
        >
          Clear Chat
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to clear all messages? This action cannot be
            undone and will permanently delete your chat history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClear}
            disabled={isClearing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isClearing ? "Clearing..." : "Clear Chat"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
