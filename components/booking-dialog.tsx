"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getMusicianById,
  musicians,
  VENUE_ADMINS,
  venues,
  type Venue,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { Message } from "@/store/types/chat.types";
import { RootState, store } from "@/store/store";
import { getInitials } from "@/utils/chatUtils";

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
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHours, setBookingHours] = useState("2");
  const [bookingMessage, setBookingMessage] = useState("");

  const adminId = VENUE_ADMINS[venue.id] ?? 1;
  const adminMusician = getMusicianById(adminId);
  const totalPrice = parseInt(bookingHours || "0") * venue.pricePerHour;

  const reset = () => {
    setBookingDate("");
    setBookingTime("");
    setBookingHours("2");
    setBookingMessage("");
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    if (!bookingDate) {
      toast({ title: "Выберите дату", variant: "destructive" });
      return;
    }
    if (!bookingTime) {
      toast({ title: "Выберите время", variant: "destructive" });
      return;
    }
    const hours = parseInt(bookingHours);
    if (!hours || hours < 1) {
      toast({ title: "Укажите количество часов", variant: "destructive" });
      return;
    }

    const dateLabel = new Date(bookingDate).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    sendBookingRequest({
      venueId: venue.id,
      venueName: venue.name,
      venueAdminId: adminId,
      date: bookingDate,
      time: bookingTime,
      hours,
      totalPrice,
      message: bookingMessage,
    });
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
    if (bookingMessage?.trim()) {
      const state = store.getState() as RootState;
      const chatId = state.chats.currentChatId;

      if (chatId) {
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chatId,
          senderId: currentUser.id.toString(),
          senderName: currentUser.name,
          senderAvatar: currentUser?.avatar,
          content: bookingMessage.trim(),
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
      title: "Заявка отправлена!",
      description: `${dateLabel} в ${bookingTime}, ${hours} ч. — ${totalPrice.toLocaleString("ru-RU")} ₽. Администратор свяжется с вами.`,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Заявка на бронирование</DialogTitle>
          <DialogDescription>
            {venue.name} — {venue.pricePerHour.toLocaleString("ru-RU")} ₽/час
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="bd-date">Дата</Label>
              <Input
                id="bd-date"
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bd-time">Время начала</Label>
              <Input
                id="bd-time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>
          </div>

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

          <Separator />

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

          {adminMusician && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {adminMusician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
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
          >
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Отправить заявку</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
