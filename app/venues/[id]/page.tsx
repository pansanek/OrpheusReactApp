"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getVenueById } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Star,
  Clock,
  Music,
  Building2,
  CalendarDays,
  ArrowLeft,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = useAuth();
  const venueId = parseInt(id);
  const venue = getVenueById(id);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHours, setBookingHours] = useState("2");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Учреждение не найдено
        </h1>
        <p className="text-muted-foreground mb-6">
          Учреждение с ID {id} не существует
        </p>
        <Link href="/venues">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "студия":
        return <Music className="h-5 w-5" />;
      case "репетиционная база":
        return <Building2 className="h-5 w-5" />;
      case "концертный зал":
        return <Building2 className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "студия":
        return "Студия звукозаписи";
      case "репетиционная база":
        return "Репетиционная база";
      case "концертный зал":
        return "Концертный зал";
      default:
        return type;
    }
  };

  const handleBooking = () => {
    if (!bookingDate || !bookingTime) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите дату и время",
        variant: "destructive",
      });
      return;
    }

    setIsBooked(true);
    setIsBookingOpen(false);
    toast({
      title: "Бронирование подтверждено!",
      description: `${venue.name} забронировано на ${bookingDate} в ${bookingTime}`,
    });
  };

  const totalPrice = parseInt(bookingHours) * venue.pricePerHour;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/venues"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к списку
      </Link>

      {/* Venue Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Venue Image Placeholder */}
            <div className="w-full lg:w-1/3 aspect-video lg:aspect-square bg-muted rounded-lg flex items-center justify-center">
              {getTypeIcon(venue.type)}
              <span className="sr-only">Фото {venue.name}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="rounded-full">
                      {getTypeLabel(venue.type)}
                    </Badge>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">
                        {venue.rating}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {venue.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{venue.address}</span>
              </div>

              <p className="text-foreground mb-6">{venue.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Стоимость</p>
                    <p className="font-semibold text-foreground">
                      {venue.pricePerHour.toLocaleString("ru-RU")} руб./час
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              {currentUser ? (
                isBooked ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      Забронировано на {bookingDate} в {bookingTime}
                    </span>
                  </div>
                ) : (
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full sm:w-auto">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Забронировать
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Бронирование: {venue.name}</DialogTitle>
                        <DialogDescription>
                          Выберите дату, время и продолжительность
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Дата</Label>
                          <Input
                            id="date"
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="time">Время начала</Label>
                          <Input
                            id="time"
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="hours">
                            Продолжительность (часов)
                          </Label>
                          <Input
                            id="hours"
                            type="number"
                            min="1"
                            max="12"
                            value={bookingHours}
                            onChange={(e) => setBookingHours(e.target.value)}
                          />
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Итого:</span>
                          <span className="text-xl font-bold text-foreground">
                            {totalPrice.toLocaleString("ru-RU")} руб.
                          </span>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsBookingOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button onClick={handleBooking}>
                          Подтвердить бронирование
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-2">
                    Войдите, чтобы забронировать
                  </p>
                  <Button asChild>
                    <Link href="/login">Войти</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Оборудование
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {venue.equipment.map((item, index) => (
              <Badge key={index} variant="outline" className="rounded-full">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Контакты</CardTitle>
          <CardDescription>Свяжитесь с администрацией</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium text-foreground">
                  +7 (999) 123-45-67
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">
                  info@{venue.name.toLowerCase().replace(/\s+/g, "")}.ru
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
