'use client';

import React from 'react';
import { Message } from '@/store/types/chat.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCheck, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  showSenderName = false,
}) => {
  const timeString = format(new Date(message.timestamp), 'HH:mm', {
    locale: ru,
  });

  return (
    <div
      className={cn('flex gap-2 max-w-[80%]', isOwnMessage ? 'ml-auto flex-row-reverse' : 'mr-auto')}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message container */}
      <div className={cn('flex flex-col gap-1', isOwnMessage ? 'items-end' : 'items-start')}>
        {/* Sender name (for group chats) */}
        {showSenderName && !isOwnMessage && (
          <p className="text-xs font-medium text-muted-foreground px-1">
            {message.senderName}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl break-words shadow-sm',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        {/* Time and read status */}
        <div
          className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground px-1',
            isOwnMessage && 'flex-row-reverse'
          )}
        >
          <time>{timeString}</time>
          {isOwnMessage && (
            <span className={cn(message.read && 'text-primary')}>
              {message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
