"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
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
  Calendar,
  Camera,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingDialog } from "@/components/booking-dialog";
import { getMusicianById } from "@/lib/storage";
import { Venue, VENUE_ADMINS } from "@/lib/types";
export default function VenuePage() {
  const params = useParams();
  const venueId = Number(params?.id);

  const { currentUser, venuesState, updateVenue, sendBookingRequest } =
    useAuth();
  const venue = venuesState.find((v) => v.id === venueId);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  // Booking state
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHours, setBookingHours] = useState("2");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedSummary, setBookedSummary] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    venue?.avatar || null,
  );
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
  useEffect(() => {
    setAvatarUrl(venue?.avatar || null);
  }, [venue?.id, venue?.avatar]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setAvatarUrl(url);
        updateVenue(venueId, { avatar: url });
        toast({ title: "Аватар обновлён" });
      };
      reader.onerror = () => {
        toast({ title: "Ошибка загрузки", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    },
    [updateVenue],
  );
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
              {/* {getTypeIcon(venue.type)}
              <span className="text-xs text-muted-foreground">
                {getTypeLabel(venue.type)}
              </span> */}
              <div className="relative shrink-0">
                <Avatar className="lg:h-48 lg:w-72 w-full lg:aspect-auto">
                  <AvatarImage
                    src={
                      venue.avatar
                        ? venue.avatar.startsWith("/")
                          ? venue.avatar
                          : `/${venue.avatar}`
                        : undefined
                    }
                    alt={venue.name}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                    {venue.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isAdmin ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                      title="Загрузить фото"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                ) : null}
              </div>
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
                <Button size="sm" onClick={() => setBookingVenue(venue)}>
                  <Calendar className="h-4 w-4 mr-2" />
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
              {/* <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {adminMusician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div> */}
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={
                    adminMusician.avatar
                      ? adminMusician.avatar.startsWith("/")
                        ? adminMusician.avatar
                        : `/${adminMusician.avatar}`
                      : undefined
                  }
                  alt={adminMusician.name}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                  {adminMusician.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
      {bookingVenue && (
        <BookingDialog
          open={bookingVenue !== null}
          onOpenChange={(open) => {
            if (!open) setBookingVenue(null);
          }}
          venue={bookingVenue}
        />
      )}
    </div>
  );
}
