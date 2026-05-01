// components/moderation/ReportActionDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ModerationQueueItem } from "@/lib/types/moderation.types";
import {
  updateModerationReportAction,
  toggleUserBan,
} from "@/store/slices/moderationSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2, ShieldCheck, ShieldX, Ban } from "lucide-react";
import { selectModerationState } from "@/store/slices/moderationSlice";
import { ReportTargetPreview } from "./ReportTargetPreview";

interface Props {
  item: ModerationQueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentModeratorId: string;
}

export const ReportActionDialog = ({
  item,
  open,
  onOpenChange,
  currentModeratorId,
}: Props) => {
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector(selectModerationState);

  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState<"dismiss" | "resolve" | "ban" | null>(
    null,
  );

  useEffect(() => {
    if (item) {
      setResolution("");
      setAction(null);
    }
  }, [item]);

  if (!item) return null;
  const { report } = item;
  const isLoading =
    actionLoading[report.id] || actionLoading[`ban_${report.targetId}`];

  const handleExecute = () => {
    if (!action) return;

    if (action === "dismiss") {
      dispatch(
        updateModerationReportAction({
          reportId: report.id,
          status: "dismissed",
          reviewedBy: currentModeratorId,
          resolution: resolution || "Нарушений не найдено",
        }),
      );
    } else if (action === "resolve") {
      dispatch(
        updateModerationReportAction({
          reportId: report.id,
          status: "resolved",
          reviewedBy: currentModeratorId,
          resolution: resolution || "Контент скрыт",
          contentUpdates: {
            targetId: report.targetId,
            targetType: report.targetType,
            updates: {
              moderationStatus: "rejected",
              hiddenFromFeed: report.targetType === "post",
              hidden: report.targetType === "message",
            },
          },
        }),
      );
    } else if (action === "ban" && report.targetType === "profile") {
      dispatch(
        toggleUserBan({
          userId: report.targetId,
          ban: true,
          reason: resolution || report.reason,
          moderatedBy: currentModeratorId,
        }),
      );
      // Дополнительно помечаем репорт как решённый
      dispatch(
        updateModerationReportAction({
          reportId: report.id,
          status: "resolved",
          reviewedBy: currentModeratorId,
          resolution: `Пользователь заблокирован: ${resolution || report.reason}`,
        }),
      );
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Рассмотрение жалобы #{report.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Жалоба от{" "}
            <strong>{report.reporterName || report.reporterId}</strong> на{" "}
            {report.targetType} •{" "}
            {new Date(report.timestamp).toLocaleString("ru-RU")}
          </DialogDescription>
          <div className="py-2">
            <ReportTargetPreview
              targetId={report.targetId}
              targetType={report.targetType}
            />
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted p-3 rounded-lg">
              <span className="text-muted-foreground block mb-1">Цель</span>
              <span className="font-mono">{report.targetId}</span>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <span className="text-muted-foreground block mb-1">Причина</span>
              <span className="capitalize font-medium">
                {report.reason.replace("_", " ")}
              </span>
            </div>
          </div>

          {report.description && (
            <div className="bg-muted/50 p-3 rounded-lg border">
              <span className="text-muted-foreground text-xs block mb-1">
                Описание жалобы:
              </span>
              <p className="text-sm whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          )}

          {report.customReason && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-yellow-700 dark:text-yellow-400 text-xs block mb-1">
                Доп. комментарий:
              </span>
              <p className="text-sm">{report.customReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Действие модератора</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={action === "dismiss" ? "default" : "outline"}
                onClick={() => setAction("dismiss")}
                disabled={isLoading}
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Отклонить (ложный)
              </Button>
              <Button
                variant={action === "resolve" ? "destructive" : "outline"}
                onClick={() => setAction("resolve")}
                disabled={isLoading}
              >
                <ShieldX className="w-4 h-4 mr-2" /> Подтвердить и скрыть
              </Button>
              {report.targetType === "profile" && (
                <Button
                  variant={action === "ban" ? "destructive" : "outline"}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => setAction("ban")}
                  disabled={isLoading}
                >
                  <Ban className="w-4 h-4 mr-2" /> Забанить профиль
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mod-resolution">
              Комментарий к решению (опционально)
            </Label>
            <Textarea
              id="mod-resolution"
              placeholder="Почему принято такое решение..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button onClick={handleExecute} disabled={!action || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Применить решение
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
