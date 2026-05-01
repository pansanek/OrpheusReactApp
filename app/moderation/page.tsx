// app/moderation/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchModerationReports,
  setPage,
  selectModerationQueue,
  selectModerationState,
} from "@/store/slices/moderationSlice";
import { ReportsFilters } from "@/components/moderation/ReportsFilters";
import { ReportsTable } from "@/components/moderation/ReportsTable";
import { ReportActionDialog } from "@/components/moderation/ReportActionDialog";
import { ModerationQueueItem } from "@/lib/types/moderation.types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const CURRENT_MODERATOR_ID = "1";
export default function ModerationPage() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    items: queueItems,
    total,
    page: queuePage,
    limit,
  } = useAppSelector(selectModerationQueue);
  // - loading и actionLoading берём из общего состояния
  const { pagination, actionLoading } = useAppSelector(selectModerationState);
  useEffect(() => {
    if (!mounted) return;
    // Если пользователя нет или роль не подходит — редирект
    if (!currentUser || !["moderator", "admin"].includes(currentUser.role)) {
      router.replace("/feed"); // или "/403", если создадите такую страницу
      return;
    }
  }, [currentUser, router, mounted]);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchModerationReports());
  }, [dispatch]);

  const handleSelect = useCallback((item: ModerationQueueItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);

  const handleQuickAction = useCallback(
    (reportId: string, action: "dismiss" | "resolve" | "ban") => {
      const item = queueItems.find((i) => i.report.id === reportId);
      if (item) {
        setSelectedItem(item);
        setDialogOpen(true);
      }
    },
    [queueItems],
  );

  // ✅ Используем total из селектора очереди, а limit/pagination — из состояния
  const totalPages = Math.ceil(total / (pagination.limit || limit)) || 1;
  if (
    !mounted ||
    !currentUser ||
    !["moderator", "admin"].includes(currentUser.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Панель модерации
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление жалобами, контентом и пользователями
          </p>
        </div>
      </div>

      <ReportsFilters />

      <ReportsTable
        items={queueItems} // ✅ было: queue.items
        onSelect={handleSelect}
        onQuickAction={handleQuickAction}
        actionLoading={actionLoading}
      />

      {/* Пагинация */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          {/* ✅ было: queue.items.length / queue.total */}
          Показано {queueItems.length} из {total} репортов
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => dispatch(setPage(pagination.page - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2">
            Стр. {pagination.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => dispatch(setPage(pagination.page + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ReportActionDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentModeratorId={CURRENT_MODERATOR_ID}
      />
    </div>
  );
}
