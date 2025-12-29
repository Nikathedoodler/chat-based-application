"use client";

import { useActionState } from "react";
import { sendMessage } from "./actions";

export default function ChatForm() {
  const [state, formState] = useActionState(sendMessage, { error: null });

  return (
    <form>
      <input
        name="message"
        placeholder="Type a message"
        required
        className="border rounded-lg focus:outline-none focus:ring-2 focus: ring-blue-500"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      ></button>
    </form>
  );
}
