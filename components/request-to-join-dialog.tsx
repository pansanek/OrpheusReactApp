"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { INSTRUMENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Send } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { addMessage, createDirectChat } from "@/store/slices/chatSlice";
import { getInitials } from "@/utils/chatUtils";
import { Message } from "@/store/types/chat.types";
import { RootState, store } from "@/store/store";

interface RequestToJoinDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupId: number;
  groupName: string;
  groupCreatorId: number;
}

export function RequestToJoinDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  groupCreatorId,
}: RequestToJoinDialogProps) {
  const { currentUser, sendJoinRequest, allUsers } = useAuth();
  const dispatch = useAppDispatch();

  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");

  const reset = () => {
    setPosition("");
    setMessage("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = () => {
    if (!currentUser) return;

    if (!position.trim()) {
      toast({ title: "Укажите позицию", variant: "destructive" });
      return;
    }

    // Отправляем запрос на вступление
    sendJoinRequest({
      toUserId: groupCreatorId, // уведомление создателю группы
      groupId,
      position,
      message,
    });

    // Создаём чат с создателем группы и отправляем сообщение
    const creator = allUsers.find((u) => u.id === groupCreatorId);
    if (creator && message?.trim()) {
      dispatch(
        createDirectChat({
          participantId: creator.id.toString(),
          participantName: creator.name,
          participantAvatar: creator.avatar || getInitials(creator.name),
          currentUserId: currentUser?.id.toString() || "user",
        }),
      );

      setTimeout(() => {
        const state = store.getState() as RootState;
        const chatId = state.chats.currentChatId;
        if (chatId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatId,
            senderId: currentUser.id.toString(),
            senderName: currentUser.name,
            senderAvatar: currentUser?.avatar,
            content: message.trim(),
            type: "text",
            timestamp: Date.now(),
            status: "sent",
          };
          dispatch(addMessage({ chatId, message: newMessage }));
        }
      }, 100);
    }

    toast({
      title: "Запрос отправлен!",
      description: `Создатель группы "${groupName}" получит уведомление.`,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Запрос на вступление</DialogTitle>
          <DialogDescription>
            Отправьте запрос на вступление в группу{" "}
            <span className="font-medium text-foreground">{groupName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Позиция */}
          <div className="grid gap-2">
            <Label htmlFor="req-position">Ваша позиция / инструмент *</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger id="req-position">
                <SelectValue placeholder="Выберите инструмент или позицию" />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENTS.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
                <SelectItem value="Вокал">Вокал</SelectItem>
                <SelectItem value="Продюсер">Продюсер</SelectItem>
                <SelectItem value="Звукорежиссёр">Звукорежиссёр</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Сообщение */}
          <div className="grid gap-2">
            <Label htmlFor="req-message">
              Сообщение{" "}
              <span className="text-muted-foreground font-normal">
                (необязательно)
              </span>
            </Label>
            <Textarea
              id="req-message"
              placeholder="Расскажите о себе, опыте и почему хотите присоединиться..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Превью */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={normalizeImagePath(currentUser.avatar) ?? undefined}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {position || "Позиция не выбрана"} • {groupName}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-1.5" />
            Отправить запрос
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
