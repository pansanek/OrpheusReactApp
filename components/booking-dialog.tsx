"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getMusicianById, VENUE_ADMINS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store/hooks";
import { addMessage, createVenueChat } from "@/store/slices/chatSlice";
import { RootState, store } from "@/store/store";
import { getInitials } from "@/utils/chatUtils";
import { Venue } from "@/lib/types";
import { AlertCircle, CalendarClock } from "lucide-react"; // 👈 Новые иконки
import { hasTimeConflict } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { normalizeImagePath } from "@/lib/utils/utils";
import { Message } from "@/lib/types/chat.types";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venue: Venue;
}

export function BookingDialog({
  open,
  onOpenChange,
  venue,
}: BookingDialogProps) {
  const { currentUser, sendBookingRequest } = useAuth();
  const dispatch = useAppDispatch();
  if (!currentUser) {
    return null;
  }
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHours, setBookingHours] = useState("2");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [timeConflict, setTimeConflict] = useState<string | null>(null);

  const adminId = VENUE_ADMINS[venue.id] ?? 1;
  const adminMusician = getMusicianById(adminId);
  const totalPrice = parseInt(bookingHours || "0") * venue.pricePerHour;

  // 👇 Минимальная дата: сегодня
  const minDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // 👇 Проверка конфликта времени при изменении параметров
  useEffect(() => {
    if (!bookingDate || !bookingTime || !bookingHours) {
      setTimeConflict(null);
      return;
    }

    const hours = parseInt(bookingHours);
    if (!hours || hours < 1) {
      setTimeConflict(null);
      return;
    }

    setIsCheckingConflict(true);

    // Небольшая задержка для дебаунса (чтобы не спамить проверками)
    const timer = setTimeout(() => {
      const conflict = hasTimeConflict?.(
        venue.id,
        bookingDate,
        bookingTime,
        hours,
      );

      if (conflict) {
        setTimeConflict("Это время уже забронировано. Выберите другое.");
      } else {
        setTimeConflict(null);
      }
      setIsCheckingConflict(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [bookingDate, bookingTime, bookingHours, venue.id, hasTimeConflict]);

  const reset = () => {
    setBookingDate("");
    setBookingTime("");
    setBookingHours("2");
    setBookingMessage("");
    setTimeConflict(null);
  };

  // 👇 Валидация перед отправкой
  const validateForm = (): boolean => {
    if (!currentUser) return false;

    if (!bookingDate) {
      toast({ title: "Выберите дату", variant: "destructive" });
      return false;
    }

    if (!bookingTime) {
      toast({ title: "Выберите время начала", variant: "destructive" });
      return false;
    }

    const hours = parseInt(bookingHours);
    if (!hours || hours < 1 || hours > 12) {
      toast({
        title: "Некорректная продолжительность",
        description: "Укажите от 1 до 12 часов",
        variant: "destructive",
      });
      return false;
    }

    // Проверка на конфликт времени
    if (timeConflict) {
      toast({
        title: "Время недоступно",
        description: timeConflict,
        variant: "destructive",
      });
      return false;
    }

    // Дублирующая проверка на всякий случай (race condition)
    if (hasTimeConflict?.(venue.id, bookingDate, bookingTime, hours)) {
      toast({
        title: "Произошёл конфликт бронирования",
        description: "Попробуйте выбрать другое время",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const hours = parseInt(bookingHours);

    const dateLabel = new Date(bookingDate).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    sendBookingRequest?.({
      venueId: venue.id,
      venueName: venue.name,
      venueAdminId: adminId,
      date: bookingDate,
      time: bookingTime,
      hours,
      totalPrice,
      message: bookingMessage,
    });

    // 👇 Создание чата с учреждением (существующая логика)
    if (venue) {
      dispatch(
        createVenueChat({
          venueId: venue.id.toString(),
          venueName: venue.name,
          type: venue.type,
          venueAdmin: adminId.toString(),
          venueLogo: venue?.avatar || getInitials(venue.name),
          currentUserId: currentUser?.id.toString() || "user",
        }),
      );
    }

    // Отправка сообщения в чат, если есть комментарий
    if (bookingMessage?.trim()) {
      const state = store.getState() as RootState;
      const chatId = state.chats.currentChatId;

      if (chatId) {
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chatId,
          senderId: currentUser.id.toString(),
          content: bookingMessage.trim(),
          type: "text",
          timestamp: Date.now(),
          status: "sent",
          read: false,
        };

        dispatch(
          addMessage({
            chatId,
            message: newMessage,
          }),
        );
      }
    }

    toast({
      title: "Заявка отправлена!",
      description: `${dateLabel} в ${bookingTime}, ${hours} ч. — ${totalPrice.toLocaleString("ru-RU")} ₽`,
    });

    reset();
    onOpenChange(false);
  };

  // Вычисляем, можно ли отправить форму
  const canSubmit = useMemo(() => {
    return (
      !!bookingDate &&
      !!bookingTime &&
      parseInt(bookingHours) >= 1 &&
      parseInt(bookingHours) <= 12 &&
      !timeConflict &&
      !isCheckingConflict
    );
  }, [
    bookingDate,
    bookingTime,
    bookingHours,
    timeConflict,
    isCheckingConflict,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Заявка на бронирование</DialogTitle>
          <DialogDescription>
            {venue.name} — {venue.pricePerHour.toLocaleString("ru-RU")} ₽/час
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* 👇 Дата и время */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="bd-date">Дата</Label>
              <Input
                id="bd-date"
                type="date"
                value={bookingDate}
                min={minDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className={timeConflict ? "border-destructive" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bd-time">Время начала</Label>
              <Input
                id="bd-time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className={timeConflict ? "border-destructive" : ""}
              />
            </div>
          </div>

          {/* Продолжительность */}
          <div className="grid gap-2">
            <Label htmlFor="bd-hours">Продолжительность (ч.)</Label>
            <Input
              id="bd-hours"
              type="number"
              min="1"
              max="12"
              value={bookingHours}
              onChange={(e) => setBookingHours(e.target.value)}
            />
          </div>

          {/* Комментарий */}
          <div className="grid gap-2">
            <Label htmlFor="bd-message">Комментарий</Label>
            <Textarea
              id="bd-message"
              placeholder="Опишите ваши цели, состав, пожелания..."
              rows={3}
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
            />
          </div>

          {/* Alert о конфликте времени */}
          {timeConflict && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{timeConflict}</AlertDescription>
            </Alert>
          )}

          {isCheckingConflict && !timeConflict && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarClock className="h-4 w-4 animate-pulse" />
              Проверка доступности...
            </div>
          )}

          <Separator />

          {/* 👇 Итого к оплате */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {bookingHours} ч. × {venue.pricePerHour.toLocaleString("ru-RU")}{" "}
                ₽
              </p>
              <p className="text-xs text-muted-foreground">Итого к оплате</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {totalPrice.toLocaleString("ru-RU")} ₽
            </p>
          </div>

          {/* 👇 Информация об администраторе */}
          {adminMusician && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        normalizeImagePath(adminMusician?.avatar) ?? undefined
                      }
                      alt={adminMusician.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(adminMusician.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Администратор</p>
                <p className="text-sm font-medium text-foreground">
                  {adminMusician.name}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            type="button"
          >
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} type="button">
            {isCheckingConflict ? "Проверка..." : "Отправить заявку"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
