// components/ReportModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ReportReason } from "@/lib/types/moderation.types";
import {
  useReportContent,
  UseReportContentOptions,
} from "@/hooks/useReportContent";

const REASON_MAP: Record<ReportReason, string> = {
  spam: "Спам или реклама",
  harassment: "Оскорбления или буллинг",
  inappropriate_content: "Неуместный контент",
  fake_profile: "Фейковый профиль",
  copyright_violation: "Нарушение авторских прав",
  off_topic: "Не по теме",
  other: "Другое",
};

interface ReportModalProps {
  options: UseReportContentOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportModal = ({
  options,
  open,
  onOpenChange,
}: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>("spam");
  const [description, setDescription] = useState("");

  // Инициализируем хук с коллбеком на успех
  const { reportContent, isSubmitting, error, success, reset } =
    useReportContent({
      ...options,
      onSuccess: () => setTimeout(() => onOpenChange(false), 1200),
    });

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
      reset();
      setSelectedReason("spam");
      setDescription("");
    }
  }, [open, reset]);

  const handleSubmit = () => {
    reportContent(selectedReason, description);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Пожаловаться</DialogTitle>
          <DialogDescription>
            Укажите причину жалобы. Модераторы рассмотрят её в ближайшее время.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Жалоба успешно отправлена!
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <>
              <RadioGroup
                value={selectedReason}
                onValueChange={(value) =>
                  setSelectedReason(value as ReportReason)
                }
                className="space-y-2"
              >
                {Object.entries(REASON_MAP).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`reason-${key}`} />
                    <Label
                      htmlFor={`reason-${key}`}
                      className="font-normal cursor-pointer select-none"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedReason === "other" && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="report-desc" className="text-sm font-medium">
                    Подробности <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="report-desc"
                    placeholder="Опишите ситуацию подробнее..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none min-h-[80px]"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {!success && !error && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (selectedReason === "other" && !description.trim())
                }
              >
                {isSubmitting ? "Отправка..." : "Отправить жалобу"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
