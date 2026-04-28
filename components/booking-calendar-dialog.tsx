"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getMusicianById } from "@/lib/mock-data";

import { BookingRequest } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Building2,
  MessageSquare,
  User,
} from "lucide-react";
import {
  getApprovedRequestsByMusicianId,
  getApprovedRequestsByVenueAdminId,
} from "@/lib/storage";

type BookingWithSource = BookingRequest & { source: "personal" | "venue" };

interface BookingCalendarDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function BookingCalendarDialog({
  open,
  onOpenChange,
}: BookingCalendarDialogProps) {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSource[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    if (currentUser && open) {
      const personal = getApprovedRequestsByMusicianId(
        currentUser.id,
        true,
      ).map((b) => ({ ...b, source: "personal" as const }));

      const venue = getApprovedRequestsByVenueAdminId(currentUser.id, true).map(
        (b) => ({ ...b, source: "venue" as const }),
      );

      const merged = [...personal, ...venue];
      const unique = Array.from(new Map(merged.map((b) => [b.id, b])).values());

      setBookings(
        unique.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        }),
      );
    }
  }, [currentUser, open]);

  // Разделяем даты для календаря
  const personalDates = useMemo(
    () =>
      bookings
        .filter((b) => b.source === "personal")
        .map((b) => new Date(b.date + "T00:00:00")),
    [bookings],
  );
  const venueDates = useMemo(
    () =>
      bookings
        .filter((b) => b.source === "venue")
        .map((b) => new Date(b.date + "T00:00:00")),
    [bookings],
  );

  // Фильтрация на выбранную дату
  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter((b) => {
      const bDate = new Date(b.date + "T00:00:00");
      return (
        bDate.getFullYear() === selectedDate.getFullYear() &&
        bDate.getMonth() === selectedDate.getMonth() &&
        bDate.getDate() === selectedDate.getDate()
      );
    });
  }, [bookings, selectedDate]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(
      date,
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Моё расписание
          </DialogTitle>
          <DialogDescription>
            Личные бронирования и заявки в ваших учреждениях
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* 📅 Календарь с двумя модификаторами */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border bg-card p-2 w-full max-w-[280px]"
              modifiers={{
                personal: personalDates,
                venue: venueDates,
              }}
              modifiersClassNames={{
                selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold rounded-full",
                personal:
                  "bg-violet-100/70 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 font-semibold ring-2 ring-violet-500/60 rounded-full",
                venue:
                  "bg-blue-100/60 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 font-semibold ring-2 ring-blue-500/50 rounded-full",
                today: "text-primary font-bold",
              }}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </div>

          {/* 📖 Динамическая легенда */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
            {personalDates.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-100 ring-1 ring-violet-500/50 dark:bg-violet-900/50" />
                <span>Моя бронь</span>
              </div>
            )}
            {venueDates.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-100 ring-1 ring-blue-500/50 dark:bg-blue-900/50" />
                <span>Бронь в моём учреждении</span>
              </div>
            )}
          </div>

          {/* 📋 Список бронирований */}
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 mt-1">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur py-1 z-10">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {selectedDate
                ? `На ${formatDate(selectedDate)}`
                : "Выберите дату"}
            </h4>

            {selectedBookings.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Нет подтверждённых бронирований
                </p>
              </div>
            ) : (
              selectedBookings.map((b) => {
                const musician = getMusicianById(b.musicianId);
                const isVenue = b.source === "venue";

                return (
                  <Card
                    key={b.id}
                    className="p-3 hover:bg-muted/30 transition-colors border-border/50"
                  >
                    {/* Бейдж источника с цветом, совпадающим с календарём */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          isVenue
                            ? "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300"
                            : "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:bg-violet-900/20 dark:text-violet-300"
                        }`}
                      >
                        {isVenue ? (
                          <Building2 className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {isVenue ? b.venueName : "Моя бронь"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
                        {musician?.name || "Музыкант"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3" /> {b.time} • {b.hours} ч.
                    </p>

                    {b.message && (
                      <div className="text-xs italic text-muted-foreground/80 line-clamp-2 flex gap-1.5 pl-0.5">
                        <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>"{b.message}"</span>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
