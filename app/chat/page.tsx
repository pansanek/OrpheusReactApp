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
        <div className="flex h-[100dvh] items-center justify-center bg-background">
          Loading chats...
        </div>
      }
    >
      <main className="h-[100dvh] w-full overflow-hidden bg-background">
        <ChatPageContent />
      </main>
    </Suspense>
  );
}
