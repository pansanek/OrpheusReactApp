"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, MapPin, Music, Users } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils/utils";
import { useAuth } from "@/contexts/auth-context";
import { GroupInviteNotification } from "@/lib/types/notification.types";

interface GroupInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: GroupInviteNotification;
}

export function GroupInviteDialog({
  open,
  onOpenChange,
  notification,
}: GroupInviteDialogProps) {
  const {
    groupsState,
    acceptGroupInvite,
    declineGroupInvite,
    acceptSendInvite,
    declineSendInvite,
  } = useAuth();
  const group = groupsState.find((g) => g.id === notification.groupId);
  const { allUsers, currentUser } = useAuth();
  const toUser = groupsState.find((g) => g.id === notification.groupId);

  const handleAccept = () => {
    // acceptGroupInvite(notification.id);
    if (!group && !currentUser) return;

    acceptSendInvite(group?.id || "", currentUser?.id || "");
    onOpenChange(false);
  };

  const handleDecline = () => {
    // declineGroupInvite(notification.id);
    if (!group && !currentUser) return;
    declineSendInvite(group?.id || "", currentUser?.id || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Приглашение в группу</DialogTitle>
          <DialogDescription>
            Вас пригласили присоединиться к музыкальному проекту
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Инфо о группе */}
          <Card className="border-muted">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 shrink-0">
                  <AvatarImage
                    src={normalizeImagePath(group?.avatar) ?? undefined}
                  />
                  <AvatarFallback className="text-[10px]">
                    {group?.name?.substring(0, 2).toUpperCase() ?? "GP"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {notification.groupName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {group?.genre || "Жанр не указан"}
                  </p>
                </div>

                <Badge variant="secondary" className="shrink-0 text-xs">
                  {notification.position}
                </Badge>
              </div>

              {group?.city && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {group.city}
                </div>
              )}

              {group?.description && (
                <p className="text-sm line-clamp-2 text-foreground/80 italic">
                  "{group.description}"
                </p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      normalizeImagePath(
                        allUsers.find((u) => u.id === notification.fromUserId)
                          ?.avatar,
                      ) ?? undefined
                    }
                  />
                  <AvatarFallback className="text-[10px]">
                    {notification.fromUserName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Пригласил:{" "}
                  <span className="font-medium text-foreground">
                    {notification.fromUserName}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t">
                {notification.message && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                    "{notification.message}"
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Предупреждение если уже в группе */}
          {group?.members.includes(useAuth().currentUser?.id ?? "0") && (
            <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              Вы уже являетесь участником этой группы
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDecline} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Отклонить
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Check className="h-4 w-4 mr-2" />
            Принять
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
