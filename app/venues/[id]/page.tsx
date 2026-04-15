"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getMusicianById, VENUE_ADMINS, VENUE_TYPES } from "@/lib/mock-data";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Info,
  Settings,
  Link2,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";

export default function VenuePage() {
  const params = useParams();
  const venueId = Number(params?.id);

  const { currentUser, venuesState, updateVenue, sendBookingRequest } =
    useAuth();
  const venue = venuesState.find((v) => v.id === venueId);

  // Booking state
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHours, setBookingHours] = useState("2");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedSummary, setBookedSummary] = useState("");

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editType, setEditType] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWorkingHours, setEditWorkingHours] = useState("");
  const [editEquipment, setEditEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");
  const [editVk, setEditVk] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editWebsite, setEditWebsite] = useState("");

  const openEdit = useCallback(() => {
    if (!venue) return;
    setEditName(venue.name);
    setEditDescription(venue.description);
    setEditAddress(venue.address);
    setEditCity(venue.city);
    setEditType(venue.type);
    setEditPrice(String(venue.pricePerHour));
    setEditPhone(venue.phone ?? "");
    setEditEmail(venue.email ?? "");
    setEditWorkingHours(venue.workingHours ?? "");
    setEditEquipment([...venue.equipment]);
    setEditVk(venue.socialLinks?.vk ?? "");
    setEditInstagram(venue.socialLinks?.instagram ?? "");
    setEditWebsite(venue.socialLinks?.website ?? "");
    setNewEquipment("");
    setIsEditOpen(true);
  }, [venue]);

  const addEquipmentItem = () => {
    const item = newEquipment.trim();
    if (!item) return;
    setEditEquipment((prev) => [...prev, item]);
    setNewEquipment("");
  };

  const removeEquipmentItem = (index: number) => {
    setEditEquipment((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveVenue = useCallback(() => {
    if (!editName.trim()) {
      toast({ title: "Название обязательно", variant: "destructive" });
      return;
    }
    const price = parseInt(editPrice);
    if (!price || price < 0) {
      toast({ title: "Укажите корректную стоимость", variant: "destructive" });
      return;
    }
    updateVenue(venueId, {
      name: editName.trim(),
      description: editDescription.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      type: editType,
      pricePerHour: price,
      phone: editPhone.trim() || undefined,
      email: editEmail.trim() || undefined,
      workingHours: editWorkingHours.trim() || undefined,
      equipment: editEquipment,
      socialLinks: {
        vk: editVk.trim() || undefined,
        instagram: editInstagram.trim() || undefined,
        website: editWebsite.trim() || undefined,
      },
    });
    setIsEditOpen(false);
    toast({ title: "Информация об учреждении обновлена" });
  }, [
    editName,
    editDescription,
    editAddress,
    editCity,
    editType,
    editPrice,
    editPhone,
    editEmail,
    editWorkingHours,
    editEquipment,
    editVk,
    editInstagram,
    editWebsite,
    venueId,
    updateVenue,
  ]);

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Учреждение не найдено
        </h1>
        <p className="text-muted-foreground mb-6">
          Учреждение с ID {venueId} не существует
        </p>
        <Link href="/venues">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  const adminId = VENUE_ADMINS[venue.id] ?? 1;
  const adminMusician = getMusicianById(adminId);
  const isAdmin = currentUser?.id === adminId;
  const totalPrice = parseInt(bookingHours || "0") * venue.pricePerHour;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "студия":
        return <Music className="h-8 w-8 text-muted-foreground" />;
      default:
        return <Building2 className="h-8 w-8 text-muted-foreground" />;
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

    setBookedSummary(`${dateLabel} в ${bookingTime}, ${hours} ч.`);
    setIsBooked(true);
    setIsBookingOpen(false);
    toast({
      title: "Заявка отправлена!",
      description: `Администратор "${venue.name}" получит уведомление.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="w-full lg:w-72 aspect-video lg:aspect-auto lg:h-48 bg-muted rounded-xl flex flex-col items-center justify-center gap-2 shrink-0">
              {getTypeIcon(venue.type)}
              <span className="text-xs text-muted-foreground">
                {getTypeLabel(venue.type)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {getTypeLabel(venue.type)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-semibold text-foreground">
                        {venue.rating}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {venue.name}
                  </h1>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={openEdit}>
                    <Settings className="h-4 w-4 mr-1.5" />
                    Настройки
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {venue.city}, {venue.address}
                </span>
                {venue.workingHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 shrink-0" />
                    {venue.workingHours}
                  </span>
                )}
              </div>

              <p className="text-foreground text-sm mb-5 leading-relaxed">
                {venue.description}
              </p>

              <div className="flex items-center gap-2 mb-5">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Стоимость</p>
                  <p className="font-semibold text-foreground">
                    {venue.pricePerHour.toLocaleString("ru-RU")} ₽/час
                  </p>
                </div>
              </div>

              {/* Social links */}
              {venue.socialLinks &&
                Object.values(venue.socialLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {venue.socialLinks.vk && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        VK
                      </Badge>
                    )}
                    {venue.socialLinks.instagram && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        Instagram
                      </Badge>
                    )}
                    {venue.socialLinks.website && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        {venue.socialLinks.website}
                      </Badge>
                    )}
                  </div>
                )}

              {/* CTA */}
              {!currentUser ? (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Войдите, чтобы забронировать
                    </p>
                    <Button asChild size="sm" className="mt-2">
                      <Link href="/login">Войти</Link>
                    </Button>
                  </div>
                </div>
              ) : isBooked ? (
                <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Заявка отправлена
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {bookedSummary}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Администратор свяжется с вами для подтверждения.
                    </p>
                  </div>
                </div>
              ) : isAdmin ? (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Вы — администратор этой площадки
                  </p>
                </div>
              ) : (
                <Button size="lg" onClick={() => setIsBookingOpen(true)}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Забронировать
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Music className="h-5 w-5 text-primary" />
            Оборудование
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {venue.equipment.map((item, i) => (
              <Badge key={i} variant="outline" className="rounded-full">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Контакты</CardTitle>
          <CardDescription>Свяжитесь с администрацией напрямую</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {venue.phone && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Телефон</p>
                <p className="font-medium text-foreground text-sm">
                  {venue.phone}
                </p>
              </div>
            </div>
          )}
          {venue.email && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm">
                  {venue.email}
                </p>
              </div>
            </div>
          )}
          {adminMusician && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {adminMusician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  Администратор площадки
                </p>
                <p className="font-medium text-foreground text-sm">
                  {adminMusician.name}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-transparent shrink-0"
              >
                <Link href={`/profile/${adminMusician.id}`}>Профиль</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
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
                <Label htmlFor="book-date">Дата</Label>
                <Input
                  id="book-date"
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-time">Время начала</Label>
                <Input
                  id="book-time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-hours">Продолжительность (ч.)</Label>
              <Input
                id="book-hours"
                type="number"
                min="1"
                max="12"
                value={bookingHours}
                onChange={(e) => setBookingHours(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-message">Комментарий</Label>
              <Textarea
                id="book-message"
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
                  {bookingHours} ч. ×{" "}
                  {venue.pricePerHour.toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs text-muted-foreground">Итого к оплате</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {totalPrice.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            {adminMusician && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
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
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleBooking}>Отправить заявку</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog (admin only) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Настройки учреждения</DialogTitle>
            <DialogDescription>
              Редактируйте публичную информацию о вашей площадке
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Basic */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="v-name">Название *</Label>
                <Input
                  id="v-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Тип площадки</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="v-desc">Описание</Label>
              <Textarea
                id="v-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="v-city">Город</Label>
                <Input
                  id="v-city"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-address">Адрес</Label>
                <Input
                  id="v-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="v-price">Цена, ₽/час</Label>
                <Input
                  id="v-price"
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-hours">Часы работы</Label>
                <Input
                  id="v-hours"
                  value={editWorkingHours}
                  onChange={(e) => setEditWorkingHours(e.target.value)}
                  placeholder="10:00 — 22:00"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="v-phone">Телефон</Label>
                <Input
                  id="v-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-email">Email</Label>
                <Input
                  id="v-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Equipment */}
            <div className="grid gap-3">
              <Label>Оборудование</Label>
              {editEquipment.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editEquipment.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-muted text-foreground"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipmentItem(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Напр.: Микрофон Shure SM7B"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEquipmentItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEquipmentItem}
                  disabled={!newEquipment.trim()}
                  className="bg-transparent shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Social */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Социальные сети
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="v-vk"
                    className="text-xs text-muted-foreground"
                  >
                    VK
                  </Label>
                  <Input
                    id="v-vk"
                    value={editVk}
                    onChange={(e) => setEditVk(e.target.value)}
                    placeholder="vk_group"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="v-inst"
                    className="text-xs text-muted-foreground"
                  >
                    Instagram
                  </Label>
                  <Input
                    id="v-inst"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    placeholder="@handle"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="v-web"
                    className="text-xs text-muted-foreground"
                  >
                    Сайт
                  </Label>
                  <Input
                    id="v-web"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="site.ru"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveVenue}>
              <Save className="h-4 w-4 mr-1.5" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
