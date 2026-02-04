'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useCurrentChat } from '@/store/hooks';
import { addMessage } from '@/store/slices/chatSlice';
import { Message } from '@/store/types/chat.types';
import { Button } from '@/components/ui/button';

export const ChatInputArea: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentChat = useCurrentChat();
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!currentChat || !message.trim()) {
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: currentChat.id,
      senderId: 'user-current',
      senderName: 'Вы',
      senderAvatar: undefined,
      content: message.trim(),
      timestamp: Date.now(),
      type: 'text',
      read: true,
    };

    dispatch(
      addMessage({
        chatId: currentChat.id,
        message: newMessage,
      })
    );

    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
    // Don't send on just Enter (allow line breaks)
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  if (!currentChat) {
    return null;
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 flex-shrink-0"
          title="Прикрепить файл"
          type="button"
        >
          <span className="text-lg">📎</span>
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Напишите сообщение..."
            className="w-full px-4 py-2.5 resize-none rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          size="sm"
          className="h-9 px-4 flex-shrink-0"
          type="button"
        >
          Отправить
        </Button>
      </div>
    </div>
  );
};
