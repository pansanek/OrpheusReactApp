// hooks/useReportContent.ts
import { useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { submitModerationReport } from "@/store/slices/moderationSlice";
import { ReportReason, ReportTargetType } from "@/lib/types/moderation.types";

export interface UseReportContentOptions {
  reporterId: string;
  reporterName?: string;
  targetId: string;
  targetType: ReportTargetType;
  onSuccess?: () => void;
}

// Явный тип возврата — чтобы TypeScript "видел" все поля
export interface UseReportContentReturn {
  reportContent: (
    reason: ReportReason,
    description?: string,
    customReason?: string,
  ) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const useReportContent = (
  options: UseReportContentOptions,
): UseReportContentReturn => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reportContent = useCallback(
    async (
      reason: ReportReason,
      description?: string,
      customReason?: string,
    ) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Клиентская валидация
        if (reason === "other" && !description?.trim()) {
          throw new Error("Укажите подробности для причины 'Другое'");
        }

        await dispatch(
          submitModerationReport({
            ...options,
            reason,
            description,
            customReason,
          }),
        );

        setSuccess(true);
        options.onSuccess?.();
      } catch (err: any) {
        const msg =
          err?.message || err?.payload || "Не удалось отправить жалобу";
        setError(msg);
      } finally {
        // Небольшая задержка для плавности UI
        setTimeout(() => setIsSubmitting(false), 200);
      }
    },
    [dispatch, options],
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  //  Возвращаем объект, соответствующий типу UseReportContentReturn
  return { reportContent, isSubmitting, error, success, reset };
};
