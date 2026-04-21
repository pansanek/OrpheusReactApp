"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { GENRES, INSTRUMENTS, musicians } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { ChevronRight, Crown, Plus, UserPlus, Users } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { addMessage, createDirectChat } from "@/store/slices/chatSlice";
import { getInitials } from "@/utils/chatUtils";
import { Message } from "@/store/types/chat.types";
import { RootState, store } from "@/store/store";

interface InviteToGroupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  toUserId: number;
  toUserName: string;
}

export function InviteToGroupDialog({
  open,
  onOpenChange,
  toUserId,
  toUserName,
}: InviteToGroupDialogProps) {
  const { currentUser, groupsState, sendGroupInvite } = useAuth();
  const dispatch = useAppDispatch();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupGenre, setNewGroupGenre] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");

  // Groups the current user is in
  const myGroups = currentUser
    ? groupsState.filter((g) => g.members.includes(currentUser.id))
    : [];

  // Groups where the invitee is already a member — these should be disabled
  const alreadyInGroupIds = new Set(
    groupsState.filter((g) => g.members.includes(toUserId)).map((g) => g.id),
  );

  // Groups available to invite into (current user is in, invitee is NOT in)
  const availableGroups = myGroups.filter((g) => !alreadyInGroupIds.has(g.id));

  const reset = () => {
    setSelectedGroupId(null);
    setCreatingNew(false);
    setNewGroupName("");
    setNewGroupGenre("");
    setNewGroupDescription("");
    setPosition("");
    setMessage("");
  };

  const handleOpenChange = (v: boolean) => {
    if (v) {
      // Auto-select only if exactly one available group exists
      if (availableGroups.length === 1) {
        setSelectedGroupId(availableGroups[0].id);
        setCreatingNew(false);
      } else if (availableGroups.length === 0) {
        // No available groups — force creating new
        setCreatingNew(true);
        setSelectedGroupId(null);
      } else {
        setCreatingNew(false);
        setSelectedGroupId(null);
      }
    } else {
      reset();
    }
    onOpenChange(v);
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    if (!creatingNew && !selectedGroupId) {
      toast({ title: "Выберите группу", variant: "destructive" });
      return;
    }
    if (creatingNew && !newGroupName.trim()) {
      toast({ title: "Укажите название группы", variant: "destructive" });
      return;
    }
    if (!position.trim()) {
      toast({ title: "Укажите позицию", variant: "destructive" });
      return;
    }

    sendGroupInvite({
      toUserId,
      groupId: creatingNew ? null : selectedGroupId,
      newGroupData: creatingNew
        ? {
            name: newGroupName,
            genre: newGroupGenre,
            description: newGroupDescription,
          }
        : undefined,
      position,
      message,
    });
    const user = musicians.find((u) => u.id.toString() === toUserId.toString());
    if (user) {
      dispatch(
        createDirectChat({
          participantId: user.id.toString(),
          participantName: user.name,
          participantAvatar: user.avatar || getInitials(user.name),
          currentUserId: currentUser?.id.toString() || "user",
        }),
      );
    }
    if (message?.trim()) {
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
          status: "sent", // или 'pending' если ждёте ответа от сервера
          // добавьте другие поля, если они есть в вашем типе
        };

        dispatch(
          addMessage({
            chatId,
            message: newMessage,
          }),
        );
      } else {
        console.warn("Chat ID not found after createDirectChat");
        // Опционально: можно показать предупреждение пользователю
      }
    }
    toast({
      title: "Приглашение отправлено!",
      description: `${toUserName} получит уведомление с вашим приглашением.`,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Пригласить в группу</DialogTitle>
          <DialogDescription>
            Выберите свою группу или создайте новую, укажите позицию для{" "}
            <span className="font-medium text-foreground">{toUserName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Group selection / creation */}
          {!creatingNew ? (
            <div className="grid gap-2">
              <Label>Группа</Label>

              {myGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  У вас пока нет групп. Создайте новую.
                </p>
              ) : (
                <div className="grid gap-2">
                  {myGroups.map((g) => {
                    const alreadyIn = alreadyInGroupIds.has(g.id);
                    const isSelected = selectedGroupId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={alreadyIn}
                        onClick={() => !alreadyIn && setSelectedGroupId(g.id)}
                        className={[
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          alreadyIn
                            ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 cursor-pointer",
                        ].join(" ")}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage
                            src={normalizeImagePath(g.avatar) ?? undefined}
                            alt={g.name}
                          />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {g.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {g.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {g.genre} · {g.members.length} участн.
                          </p>
                        </div>
                        {alreadyIn ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs gap-1"
                          >
                            <Users className="h-3 w-3" />
                            Уже в группе
                          </Badge>
                        ) : isSelected ? (
                          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        ) : null}
                        {!alreadyIn &&
                          myGroups.filter((x) => !alreadyInGroupIds.has(x.id))
                            .length === 1 && (
                            <Crown className="h-4 w-4 text-warning shrink-0" />
                          )}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-2 mt-1 bg-transparent"
                onClick={() => {
                  setCreatingNew(true);
                  setSelectedGroupId(null);
                }}
              >
                <Plus className="h-4 w-4" />
                Создать новую группу
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Новая группа
                </p>
                {myGroups.length > 0 && availableGroups.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setCreatingNew(false);
                      setSelectedGroupId(
                        availableGroups.length === 1
                          ? availableGroups[0].id
                          : null,
                      );
                    }}
                  >
                    Выбрать существующую
                  </Button>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-group-name">Название</Label>
                <Input
                  id="inv-group-name"
                  placeholder="Название группы"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-group-genre">Жанр</Label>
                <Select value={newGroupGenre} onValueChange={setNewGroupGenre}>
                  <SelectTrigger id="inv-group-genre">
                    <SelectValue placeholder="Выберите жанр" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-group-desc">Описание</Label>
                <Textarea
                  id="inv-group-desc"
                  placeholder="Краткое описание группы"
                  rows={2}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="inv-position">Позиция / инструмент</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger id="inv-position">
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

          <div className="grid gap-2">
            <Label htmlFor="inv-message">
              Сообщение{" "}
              <span className="text-muted-foreground font-normal">
                (необязательно)
              </span>
            </Label>
            <Textarea
              id="inv-message"
              placeholder="Расскажите о вашей группе и почему вы хотите пригласить этого музыканта..."
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Отправить приглашение
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
