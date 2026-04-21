"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GroupInviteNotification, useAuth } from "@/lib/auth-context";
import {
  INSTRUMENTS,
  GENRES,
  STATUSES,
  AI_TAG_CATEGORIES,
  USER_ROLES,
  VENUE_ADMINS,
  getGroupsByMusicianId,
  getPostsByAuthorId,
} from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Music,
  Users,
  Newspaper,
  Edit,
  Sparkles,
  Phone,
  Link2,
  X,
  Plus,
  Save,
  Check,
  GraduationCap,
  Building2,
  Mic2,
  Sliders,
  Camera,
  MoreHorizontal,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  musician: Music,
  teacher: GraduationCap,
  venue_admin: Building2,
  producer: Mic2,
  sound_engineer: Sliders,
  journalist: Newspaper,
};
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { normalizeImagePath } from "@/lib/utils";
import { GroupInviteDialog } from "@/components/group-invite-dialog";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile, notificationsByUser } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentUser?.avatar || null,
  );

  useEffect(() => {
    setAvatarUrl(currentUser?.avatar || null);
  }, [currentUser?.id, currentUser?.avatar]);
  const { allUsers } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setAvatarUrl(url);
        updateProfile({ avatar: url });
        toast({ title: "Аватар обновлён" });
      };
      reader.onerror = () => {
        toast({ title: "Ошибка загрузки", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    },
    [updateProfile],
  );
  const myInvites = currentUser
    ? ((notificationsByUser[currentUser.id] || []).filter(
        (n) => n.type === "group_invite",
      ) as GroupInviteNotification[])
    : [];
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState(3);
  const [editInstruments, setEditInstruments] = useState<string[]>([]);
  const [editGenres, setEditGenres] = useState<string[]>([]);
  const [editVk, setEditVk] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [editSoundcloud, setEditSoundcloud] = useState("");
  const [selectedInvite, setSelectedInvite] =
    useState<GroupInviteNotification | null>(null);
  const openEdit = useCallback(() => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditBio(currentUser.bio);
    setEditLocation(currentUser.location);
    setEditPhone(currentUser.phone ?? "");
    setEditEmail(currentUser.email);
    setEditStatus(currentUser.status);
    setEditSkillLevel(currentUser.skillLevel);
    setEditInstruments([...currentUser.instruments]);
    setEditGenres([...currentUser.genres]);
    setEditVk(currentUser.socialLinks?.vk ?? "");
    setEditYoutube(currentUser.socialLinks?.youtube ?? "");
    setEditSoundcloud(currentUser.socialLinks?.soundcloud ?? "");
    setIsEditOpen(true);
  }, [currentUser]);

  const handleSave = useCallback(() => {
    if (!editName.trim()) {
      toast({ title: "Имя обязательно", variant: "destructive" });
      return;
    }
    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      status: editStatus as "online" | "offline" | "busy" | "recording",
      skillLevel: editSkillLevel,
      instruments: editInstruments,
      genres: editGenres,
      socialLinks: {
        vk: editVk.trim() || undefined,
        youtube: editYoutube.trim() || undefined,
        soundcloud: editSoundcloud.trim() || undefined,
      },
    });
    setIsEditOpen(false);
    toast({ title: "Профиль обновлён" });
  }, [
    editName,
    editBio,
    editLocation,
    editPhone,
    editEmail,
    editStatus,
    editSkillLevel,
    editInstruments,
    editGenres,
    editVk,
    editTelegram,
    editYoutube,
    editSoundcloud,
    updateProfile,
  ]);

  const toggleInstrument = (instr: string) => {
    setEditInstruments((prev) =>
      prev.includes(instr) ? prev.filter((i) => i !== instr) : [...prev, instr],
    );
  };

  const toggleGenre = (genre: string) => {
    setEditGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  if (!currentUser) {
    router.push("/login");
    return null;
  }

  const userGroups = getGroupsByMusicianId(currentUser.id);
  const userPosts = getPostsByAuthorId(currentUser.id);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-[var(--status-online)]";
      case "busy":
        return "bg-[var(--status-busy)]";
      case "recording":
        return "bg-[var(--status-recording)]";
      default:
        return "bg-[var(--status-offline)]";
    }
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      Рок: "bg-[var(--genre-rock)] text-white",
      Джаз: "bg-[var(--genre-jazz)] text-white",
      Классика: "bg-[var(--genre-classical)] text-black",
      Электроника: "bg-[var(--genre-electronic)] text-white",
      Поп: "bg-[var(--genre-pop)] text-white",
      "Хип-хоп": "bg-[var(--genre-hiphop)] text-white",
    };
    return colors[genre] || "bg-muted text-muted-foreground";
  };

  const getTagCategoryColor = (category: string) => {
    const cat = AI_TAG_CATEGORIES.find((c) => c.id === category);
    return cat?.color || "#6C757D";
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor(diff / 36e5);
    const minutes = Math.floor(diff / 6e4);
    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return "Только что";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    normalizeImagePath(avatarUrl) ??
                    normalizeImagePath(currentUser.avatar) ??
                    undefined
                  }
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-1 right-8 w-5 h-5 ${getStatusColor(currentUser.status)} border-2 border-card rounded-full`}
              />
              {/* Upload button */}
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

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {currentUser.name}
                  </h1>
                  {currentUser.role &&
                    (() => {
                      const roleInfo = USER_ROLES.find(
                        (r) => r.id === currentUser.role,
                      );
                      const RoleIcon = ROLE_ICONS[currentUser.role] ?? Music;
                      return roleInfo ? (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-primary mt-0.5">
                          <RoleIcon className="h-4 w-4 shrink-0" />
                          {roleInfo.label}
                        </p>
                      ) : null;
                    })()}
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openEdit}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  Редактировать
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {currentUser.location}
                </span>
                {currentUser.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {currentUser.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {currentUser.instruments.join(", ")}
                </span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < currentUser.skillLevel ? "fill-warning text-warning" : "text-muted"}`}
                    />
                  ))}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentUser.genres.map((genre) => (
                  <Badge key={genre} className={getGenreColor(genre)}>
                    {genre}
                  </Badge>
                ))}
              </div>

              {currentUser.bio && (
                <p className="text-foreground text-sm leading-relaxed mb-4">
                  {currentUser.bio}
                </p>
              )}

              {/* Social links */}
              {currentUser.socialLinks &&
                Object.values(currentUser.socialLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.socialLinks.vk && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        VK: {currentUser.socialLinks.vk}
                      </Badge>
                    )}
                    {currentUser.socialLinks.youtube && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        YT: {currentUser.socialLinks.youtube}
                      </Badge>
                    )}
                    {currentUser.socialLinks.soundcloud && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        SC: {currentUser.socialLinks.soundcloud}
                      </Badge>
                    )}
                  </div>
                )}
              {/* Venue link for venue_admin */}
              {currentUser.role === "venue_admin" &&
                (() => {
                  const venueId = Object.entries(VENUE_ADMINS).find(
                    ([, adminId]) => adminId === currentUser.id,
                  )?.[0];
                  if (!venueId) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        <Link href={`/venues/${venueId}`}>
                          <Building2 className="h-4 w-4" />
                          Перейти на страницу площадки
                        </Link>
                      </Button>
                    </div>
                  );
                })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Tags */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Теги для ИИ-рекомендаций
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/ai-tags">Управление</Link>
            </Button>
          </div>
          <CardDescription>
            Эти теги помогают подбирать вам подходящих партнёров
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser.aiTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentUser.aiTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{
                    borderColor: getTagCategoryColor(tag.category),
                    color: getTagCategoryColor(tag.category),
                  }}
                  className="rounded-full"
                >
                  {tag.text}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              У вас ещё нет тегов.{" "}
              <Link href="/ai-tags" className="text-primary hover:underline">
                Добавьте теги
              </Link>
              , чтобы получать лучшие рекомендации.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Role-specific info card */}
      {currentUser.role === "teacher" && currentUser.teacherProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5 text-primary" />
              Преподавательский профиль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Опыт</p>
                <p className="font-medium">
                  {currentUser.teacherProfile.experience} лет
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Стоимость урока</p>
                <p className="font-medium">
                  {currentUser.teacherProfile.pricePerHour} ₽/час
                </p>
              </div>
            </div>
            {currentUser.teacherProfile.education && (
              <div>
                <p className="text-muted-foreground">Образование</p>
                <p className="font-medium">
                  {currentUser.teacherProfile.education}
                </p>
              </div>
            )}
            {currentUser.teacherProfile.subjects?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Дисциплины</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.teacherProfile.subjects.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {currentUser.teacherProfile.lessonFormats?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Формат занятий</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.teacherProfile.lessonFormats.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {currentUser.teacherProfile.ageGroups?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">
                  Возрастные группы
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.teacherProfile.ageGroups.map((a) => (
                    <Badge key={a} variant="outline">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentUser.role === "producer" && currentUser.producerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic2 className="h-5 w-5 text-primary" />
              Профиль продюсера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {currentUser.producerProfile.specialization?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Специализация</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.producerProfile.specialization.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {currentUser.producerProfile.services?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Услуги</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.producerProfile.services.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {currentUser.producerProfile.artistsWorkedWith && (
              <div>
                <p className="text-muted-foreground">Опыт работы</p>
                <p className="font-medium">
                  {currentUser.producerProfile.artistsWorkedWith}
                </p>
              </div>
            )}
            {currentUser.producerProfile.labelAffiliation && (
              <div>
                <p className="text-muted-foreground">Лейбл / агентство</p>
                <p className="font-medium">
                  {currentUser.producerProfile.labelAffiliation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentUser.role === "sound_engineer" &&
        currentUser.soundEngineerProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sliders className="h-5 w-5 text-primary" />
                Профиль звукорежиссёра
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentUser.soundEngineerProfile.specialization?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Специализация</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.soundEngineerProfile.specialization.map(
                      (s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}
              {currentUser.soundEngineerProfile.software?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">ПО</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.soundEngineerProfile.software.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {currentUser.soundEngineerProfile.hardwareSummary && (
                <div>
                  <p className="text-muted-foreground">Оборудование</p>
                  <p className="font-medium">
                    {currentUser.soundEngineerProfile.hardwareSummary}
                  </p>
                </div>
              )}
              {currentUser.soundEngineerProfile.studioAffiliation && (
                <div>
                  <p className="text-muted-foreground">Студия / место работы</p>
                  <p className="font-medium">
                    {currentUser.soundEngineerProfile.studioAffiliation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Tabs */}
      <Tabs defaultValue="groups">
        <TabsList className="mb-4">
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Группы ({userGroups.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Посты ({userPosts.length})
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Bell className="h-4 w-4" />
            Приглашения ({myInvites.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="groups">
          {userGroups.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {userGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={normalizeImagePath(group.avatar) ?? undefined}
                          alt={group.name}
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {group.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {group.name}
                        </CardTitle>
                        <CardDescription>{group.genre}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {group.description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Link href={`/groups/${group.id}`}>Открыть</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Вы ещё не состоите в группах
                </p>
                <Button asChild>
                  <Link href="/groups">Найти группу</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="posts">
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              allUsers.find((u) => u.id === currentUser.id)
                                ?.avatar ?? undefined
                            }
                            alt={currentUser.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getInitials(currentUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.timestamp)}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Сохранить</DropdownMenuItem>
                          <DropdownMenuItem>
                            Скопировать ссылку
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Пожаловаться
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <p className="text-foreground mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(post.timestamp).toLocaleDateString("ru-RU")}
                      </span>
                      <span>{post.likes.length} лайков</span>
                      <span>{post.comments.length} комментариев</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  У вас ещё нет постов
                </p>
                <Button asChild>
                  <Link href="/feed">Перейти в ленту</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="invites">
          {myInvites.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {myInvites.map((invite) => (
                <Card
                  key={invite.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-muted"
                  onClick={() => setSelectedInvite(invite)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{invite.groupName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {invite.position} • {invite.fromUserName}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      Ожидает
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Нет активных приглашений</p>
            </div>
          )}
        </TabsContent>{" "}
      </Tabs>
      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>Обновите информацию о себе</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Basic info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Имя *</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Город</Label>
                <Input
                  id="edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Москва"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Телефон</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bio">О себе</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                placeholder="Расскажите о своём опыте, стиле и целях..."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Статус</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Уровень мастерства</Label>
                <div className="flex items-center gap-2 h-10">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEditSkillLevel(level)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${level <= editSkillLevel ? "fill-warning text-warning" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Instruments */}
            <div className="grid gap-2">
              <Label>Инструменты</Label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map((instr) => (
                  <button
                    key={instr}
                    type="button"
                    onClick={() => toggleInstrument(instr)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                      editInstruments.includes(instr)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {editInstruments.includes(instr) && (
                      <Check className="h-3 w-3" />
                    )}
                    {instr}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div className="grid gap-2">
              <Label>Жанры</Label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                      editGenres.includes(genre)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {editGenres.includes(genre) && (
                      <Check className="h-3 w-3" />
                    )}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Social links */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Социальные сети
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="edit-vk"
                    className="text-xs text-muted-foreground"
                  >
                    VK (username)
                  </Label>
                  <Input
                    id="edit-vk"
                    value={editVk}
                    onChange={(e) => setEditVk(e.target.value)}
                    placeholder="my_vk_page"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="edit-tg"
                    className="text-xs text-muted-foreground"
                  >
                    Telegram (username)
                  </Label>
                  <Input
                    id="edit-tg"
                    value={editTelegram}
                    onChange={(e) => setEditTelegram(e.target.value)}
                    placeholder="mytelegram"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="edit-yt"
                    className="text-xs text-muted-foreground"
                  >
                    YouTube (channel)
                  </Label>
                  <Input
                    id="edit-yt"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    placeholder="mychannel"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="edit-sc"
                    className="text-xs text-muted-foreground"
                  >
                    SoundCloud (username)
                  </Label>
                  <Input
                    id="edit-sc"
                    value={editSoundcloud}
                    onChange={(e) => setEditSoundcloud(e.target.value)}
                    placeholder="mysoundcloud"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedInvite && (
        <GroupInviteDialog
          open={!!selectedInvite}
          onOpenChange={(open) => !open && setSelectedInvite(null)}
          notification={selectedInvite}
        />
      )}
    </div>
  );
}
