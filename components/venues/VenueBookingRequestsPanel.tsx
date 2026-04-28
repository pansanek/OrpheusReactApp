"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getMusicianById } from "@/lib/mock-data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { BookingRequest } from "@/lib/types";
import {
  Check,
  X,
  CalendarClock,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  getRequestsByVenueId,
  updateBookingRequestStatus,
} from "@/lib/storage";
import { normalizeImagePath } from "@/lib/utils/utils";

interface VenueBookingRequestsPanelProps {
  venueId: string;
  venueName: string;
  adminId: string;
  onStatusChange?: (request: BookingRequest) => void;
}

export function VenueBookingRequestsPanel({
  venueId,
  // venueName,
  adminId,
  onStatusChange,
}: VenueBookingRequestsPanelProps) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>(() =>
    getRequestsByVenueId(venueId, true),
  );
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "declined"
  >("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 🔹 Проверка прав
  if (currentUser?.id !== adminId) return null;

  // 🔹 Фильтрация
  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  // 🔹 Счётчики для табов (всегда считаются, даже если 0)
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    declined: requests.filter((r) => r.status === "declined").length,
    all: requests.length,
  };

  // 🔹 Обработчик изменения статуса
  const handleStatusChange = async (
    requestId: string,
    newStatus: "approved" | "declined",
  ) => {
    setUpdatingId(requestId);
    try {
      const updated = updateBookingRequestStatus(requestId, newStatus);
      if (updated) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? updated : r)),
        );
        const actionText =
          newStatus === "approved" ? "подтверждена" : "отклонена";
        toast({
          title: `Заявка ${actionText}`,
          description: `${updated.hours} ч. на ${new Date(updated.date).toLocaleDateString("ru-RU")}`,
          variant: newStatus === "approved" ? "default" : "destructive",
        });
        onStatusChange?.(updated);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "short",
    });

  // 🔹 Пустое состояние (показывается только когда список полностью пуст)
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Заявки на бронирование</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              Заявок пока нет
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Здесь будут отображаться запросы на бронирование
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg">Заявки на бронирование</CardTitle>

          {/* ✅ ФИКС: Табы рендерятся ВСЕГДА, независимо от количества */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {(["pending", "approved", "declined", "all"] as const).map((f) => {
              const isActive = filter === f;
              const labels = {
                pending: "Ожидают",
                approved: "Подтверждено",
                declined: "Отклонено",
                all: "Все",
              };
              return (
                <Button
                  key={f}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs px-2.5 transition-all ${isActive ? "shadow-sm" : "opacity-70 hover:opacity-100"}`}
                  onClick={() => setFilter(f)}
                >
                  {labels[f]}
                  <span className="ml-1.5 text-[10px] font-mono opacity-80">
                    {counts[f]}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Нет заявок в этой категории
          </div>
        ) : (
          filteredRequests.map((request) => {
            const musician = getMusicianById(request.musicianId);
            const isUpdating = updatingId === request.id;
            if (!musician) return;
            return (
              <div
                key={request.id}
                className="p-3 rounded-lg border bg-card transition-colors hover:border-border/80"
              >
                {/* Шапка */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={normalizeImagePath(musician.avatar) ?? undefined}
                        alt={musician.name}
                      />
                      <AvatarFallback className="text-xs">
                        {musician?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "MU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {musician?.name ?? "Неизвестный музыкант"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {musician?.instruments?.join(", ") ?? "—"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${
                      request.status === "pending"
                        ? "bg-warning/15 text-warning border-warning/20"
                        : request.status === "approved"
                          ? "bg-green-500/15 text-green-600 border-green-500/20"
                          : "bg-red-500/15 text-red-600 border-red-500/20"
                    }`}
                  >
                    {request.status === "pending"
                      ? "Ожидает"
                      : request.status === "approved"
                        ? "Подтверждено"
                        : "Отклонено"}
                  </Badge>
                </div>

                {/* Детали */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>{formatDate(request.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {request.time} • {request.hours} ч.
                    </span>
                  </div>
                  {request.message && (
                    <div className="col-span-2 flex items-start gap-1.5 mt-1">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="text-xs italic text-muted-foreground/80 line-clamp-2">
                        "{request.message}"
                      </span>
                    </div>
                  )}
                </div>

                {/* ✅ ФИКС: Обе кнопки всегда рендерятся для pending */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">
                    {request.totalPrice.toLocaleString("ru-RU")} ₽
                  </span>

                  {request.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        className="h-8 text-xs px-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          handleStatusChange(request.id, "declined")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5 mr-1" />
                        )}
                        Отклонить
                      </Button>
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          handleStatusChange(request.id, "approved")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        Принять
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {request.updatedAt
                        ? `Изменено: ${new Date(request.updatedAt).toLocaleDateString("ru-RU")}`
                        : "Статус зафиксирован"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
