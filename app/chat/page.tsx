"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import React, { Suspense } from "react";

function ChatPageContent() {
  return <ChatContainer />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          Loading chats...
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
