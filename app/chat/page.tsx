"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import { useAuth } from "@/contexts/auth-context";
import { useAppDispatch } from "@/store/hooks";
import { setMusicians } from "@/store/slices/chatSlice";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect } from "react";

function ChatPageContent() {
  return <ChatContainer />;
}

export default function ChatPage() {
  const router = useRouter();
  const { currentUser, allUsers } = useAuth();
  if (!currentUser) {
    router.push("/login");
    return null;
  }
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 🔹 Замените на реальный запрос, если есть бэкенд
    dispatch(setMusicians(allUsers));
  }, [dispatch]);

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
