// components/moderation/ReportTargetPreview.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Image, Music, Video, User } from "lucide-react";
import { ReportTargetType } from "@/lib/types/moderation.types";
import {
  getPostPreview,
  getMessagePreview,
  getUserPreview,
  truncateText,
  formatTimestamp,
} from "@/lib/storage/moderation.helpers";

interface ReportTargetPreviewProps {
  targetId: string;
  targetType: ReportTargetType;
}

export const ReportTargetPreview = ({
  targetId,
  targetType,
}: ReportTargetPreviewProps) => {
  // === ПОСТ ===
  if (targetType === "post") {
    const post = getPostPreview(targetId);
    if (!post) {
      return (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            Пост не найден (возможно, уже удалён)
          </CardContent>
        </Card>
      );
    }

    const author = getUserPreview(post.authorId);

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author?.avatar ?? undefined} />
              <AvatarFallback>
                {author?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {author?.name || "Неизвестный автор"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(post.timestamp)}
              </p>
            </div>
            {post.groupId && (
              <Badge variant="secondary" className="text-xs">
                Группа
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm whitespace-pre-wrap">
            {truncateText(post.content, 300)}
          </p>

          {/* Медиа-превью */}
          {post.media?.[0] && (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {post.media[0].type === "image" && (
                <img
                  src={post.media[0].url}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              )}
              {post.media[0].type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Video className="w-8 h-8 text-white" />
                  <span className="absolute bottom-2 text-white text-xs">
                    Видео
                  </span>
                </div>
              )}
              {post.media[0].type === "audio" && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Music className="w-8 h-8 text-muted-foreground" />
                  <span className="absolute bottom-2 text-xs text-muted-foreground">
                    Аудио
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Ссылка */}
          <Link
            href={post.groupId ? `/groups/${post.groupId}` : "/feed"}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            target="_blank"
          >
            Открыть пост <ExternalLink className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  // === СООБЩЕНИЕ ===
  if (targetType === "message") {
    const message = getMessagePreview(targetId);
    if (!message) {
      return (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            Сообщение не найдено (возможно, уже удалено)
          </CardContent>
        </Card>
      );
    }

    const sender = getUserPreview(message.senderId);
    const chatType = message.chatId.split(":")[0];

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={sender?.avatar ?? undefined} />
              <AvatarFallback>
                {sender?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {sender?.name || "Неизвестный"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {chatType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
            {truncateText(message.content, 300)}
          </p>

          {/* Вложения */}
          {message.attachments?.[0] && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Image className="w-4 h-4" />
              <span className="truncate">{message.attachments[0].name}</span>
            </div>
          )}

          {/* Ссылка на чат */}
          <Link
            href={`/chat?chat=${message.chatId}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            target="_blank"
          >
            Открыть чат <ExternalLink className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  // === ПРОФИЛЬ ===
  if (targetType === "profile") {
    const user = getUserPreview(targetId);
    if (!user) {
      return (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            Профиль не найден (возможно, удалён)
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="text-lg">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{user.name}</h4>
                <Badge variant="secondary" className="text-xs capitalize">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {user.location}
              </p>

              {/* Инструменты */}
              {user.instruments?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.instruments.slice(0, 3).map((inst) => (
                    <Badge key={inst} variant="outline" className="text-[10px]">
                      {inst}
                    </Badge>
                  ))}
                  {user.instruments.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{user.instruments.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Био */}
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {truncateText(user.bio, 150)}
                </p>
              )}
            </div>
          </div>

          {/* Ссылка на профиль */}
          <Link
            href={`/profile/${user.id}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
            target="_blank"
          >
            <User className="w-3 h-3" /> Открыть профиль{" "}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
};
