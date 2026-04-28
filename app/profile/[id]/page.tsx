"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  // DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Star,
  MapPin,
  Music,
  Users,
  Newspaper,
  MessageCircle,
  UserPlus,
  Sparkles,
  Plus,
  ChevronRight,
  Crown,
  Phone,
  Link2,
  GraduationCap,
  Building2,
  Mic2,
  Sliders,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { normalizeImagePath } from "@/lib/utils/utils";
import {
  getGroupsByMusicianId,
  getMusicianById,
  getPostsByAuthorId,
} from "@/lib/storage";
import { AI_TAG_CATEGORIES, GENRES, INSTRUMENTS } from "@/lib/constants";
import { USER_ROLES, VENUE_ADMINS } from "@/lib/types";

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

export default function PublicProfilePage() {
  const params = useParams();
  const musicianId = String(params?.id);
  const { currentUser, sendGroupInvite, groupsState, posts } = useAuth();
  const musician = getMusicianById(musicianId);
  const router = useRouter();
  if (!currentUser) {
    router.push("/login");
    return null;
  }
  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupGenre, setNewGroupGenre] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [position, setPosition] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  if (!musician) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Музыкант не найден
        </h1>
        <p className="text-muted-foreground mb-6">
          Профиль с ID {musicianId} не существует
        </p>
        <Link href="/search">
          <Button>Найти музыкантов</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === musician.id;
  const userGroups = getGroupsByMusicianId(musician.id, groupsState);
  const userPosts = getPostsByAuthorId(musician.id, posts);

  // Current user's groups (as creator or member)
  const myGroups = currentUser
    ? groupsState.filter((g) => g.members.includes(currentUser.id))
    : [];

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "В сети";
      case "busy":
        return "Занят";
      case "recording":
        return "В студии";
      default:
        return "Не в сети";
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

  const handleOpenInvite = () => {
    // Auto-select if user has exactly one group
    if (myGroups.length === 1) {
      setSelectedGroupId(myGroups[0].id);
      setCreatingNew(false);
    } else if (myGroups.length === 0) {
      setCreatingNew(true);
    }
    setInviteOpen(true);
  };

  const handleInviteSubmit = () => {
    if (!currentUser && !selectedGroupId) return;
    if (!creatingNew && !selectedGroupId) {
      toast({ title: "Выберите группу", variant: "destructive" });
      return;
    }
    if (creatingNew && !newGroupName.trim()) {
      toast({ title: "Укажите название группы", variant: "destructive" });
      return;
    }
    if (!position.trim()) {
      toast({ title: "Укажите позицию", variant: "destructive" });
      return;
    }

    sendGroupInvite({
      toUserId: musician.id,
      groupId: selectedGroupId || "",
      newGroupData: creatingNew
        ? {
            name: newGroupName,
            genre: newGroupGenre,
            description: newGroupDescription,
          }
        : undefined,
      position,
      message: inviteMessage,
      fromUserId: currentUser.id,
    });

    toast({
      title: "Приглашение отправлено!",
      description: `${musician.name} получит уведомление с вашим приглашением.`,
    });

    // Reset
    setInviteOpen(false);
    setSelectedGroupId(null);
    setCreatingNew(false);
    setNewGroupName("");
    setNewGroupGenre("");
    setNewGroupDescription("");
    setPosition("");
    setInviteMessage("");
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
                  src={normalizeImagePath(musician.avatar)}
                  alt={musician.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(musician.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 ${getStatusColor(musician.status)} border-2 border-card rounded-full`}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {musician.name}
                  </h1>
                  {musician.role &&
                    (() => {
                      const roleInfo = USER_ROLES.find(
                        (r) => r.id === musician.role,
                      );
                      return roleInfo ? (
                        <p className="text-sm font-medium text-primary mt-0.5">
                          {roleInfo.label}
                        </p>
                      ) : null;
                    })()}
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(musician.status)}`}
                    />
                    {getStatusText(musician.status)}
                  </p>
                </div>
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Написать
                    </Button>
                    <Button size="sm" onClick={handleOpenInvite}>
                      <UserPlus className="h-4 w-4 mr-1.5" />В группу
                    </Button>
                  </div>
                )}
                {isOwnProfile && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/profile">Редактировать</Link>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {musician.location}
                </span>
                {musician.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {musician.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {musician.instruments.join(", ")}
                </span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < musician.skillLevel ? "fill-warning text-warning" : "text-muted"}`}
                    />
                  ))}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {musician.genres.map((genre) => (
                  <Badge key={genre} className={getGenreColor(genre)}>
                    {genre}
                  </Badge>
                ))}
              </div>

              {musician.bio && (
                <p className="text-foreground text-sm leading-relaxed mb-4">
                  {musician.bio}
                </p>
              )}

              {/* Social links */}
              {musician.socialLinks &&
                Object.values(musician.socialLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {musician.socialLinks.vk && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        VK: {musician.socialLinks.vk}
                      </Badge>
                    )}
                    {musician.socialLinks.youtube && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        YT: {musician.socialLinks.youtube}
                      </Badge>
                    )}
                    {musician.socialLinks.soundcloud && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        SC: {musician.socialLinks.soundcloud}
                      </Badge>
                    )}
                  </div>
                )}

              {/* Venue link for venue_admin */}
              {musician.role === "venue_admin" &&
                (() => {
                  const venueId = Object.entries(VENUE_ADMINS).find(
                    ([, adminId]) => adminId === musician.id,
                  )?.[0];
                  if (!venueId) return null;
                  return (
                    <div className="mt-2 pt-4 border-t border-border">
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
      {musician.aiTags.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Интересы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {musician.aiTags.map((tag) => (
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
          </CardContent>
        </Card>
      )}

      {/* Role-specific info */}
      {musician.role === "teacher" && musician.teacherProfile && (
        <Card className="mb-6">
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
                  {musician.teacherProfile.experience} лет
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Стоимость урока</p>
                <p className="font-medium">
                  {musician.teacherProfile.pricePerHour} ₽/час
                </p>
              </div>
            </div>
            {musician.teacherProfile.education && (
              <div>
                <p className="text-muted-foreground">Образование</p>
                <p className="font-medium">
                  {musician.teacherProfile.education}
                </p>
              </div>
            )}
            {musician.teacherProfile.subjects?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Дисциплины</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.teacherProfile.subjects.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.teacherProfile.lessonFormats?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Формат занятий</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.teacherProfile.lessonFormats.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.teacherProfile.ageGroups?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">
                  Возрастные группы
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.teacherProfile.ageGroups.map((a) => (
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

      {musician.role === "producer" && musician.producerProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic2 className="h-5 w-5 text-primary" />
              Профиль продюсера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {musician.producerProfile.specialization?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Специализация</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.producerProfile.specialization.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.producerProfile.services?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Услуги</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.producerProfile.services.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.producerProfile.artistsWorkedWith && (
              <div>
                <p className="text-muted-foreground">Опыт работы</p>
                <p className="font-medium">
                  {musician.producerProfile.artistsWorkedWith}
                </p>
              </div>
            )}
            {musician.producerProfile.labelAffiliation && (
              <div>
                <p className="text-muted-foreground">Лейбл / агентство</p>
                <p className="font-medium">
                  {musician.producerProfile.labelAffiliation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {musician.role === "sound_engineer" && musician.soundEngineerProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-5 w-5 text-primary" />
              Профиль звукорежиссёра
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {musician.soundEngineerProfile.specialization?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">Специализация</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.soundEngineerProfile.specialization.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.soundEngineerProfile.software?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1.5">ПО</p>
                <div className="flex flex-wrap gap-1.5">
                  {musician.soundEngineerProfile.software.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {musician.soundEngineerProfile.hardwareSummary && (
              <div>
                <p className="text-muted-foreground">Оборудование</p>
                <p className="font-medium">
                  {musician.soundEngineerProfile.hardwareSummary}
                </p>
              </div>
            )}
            {musician.soundEngineerProfile.studioAffiliation && (
              <div>
                <p className="text-muted-foreground">Студия / место работы</p>
                <p className="font-medium">
                  {musician.soundEngineerProfile.studioAffiliation}
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
                <p className="text-muted-foreground">
                  Музыкант ещё не состоит в группах
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts">
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id}>
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
                <p className="text-muted-foreground">
                  У музыканта ещё нет постов
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite to Group Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Пригласить в группу</DialogTitle>
            <DialogDescription>
              Выберите свою группу или создайте новую, укажите позицию для{" "}
              <span className="font-medium text-foreground">
                {musician.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Group selection */}
            {!creatingNew ? (
              <div className="grid gap-2">
                <Label>Группа</Label>
                {myGroups.length > 1 ? (
                  <div className="grid gap-2">
                    {myGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroupId(g.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                          selectedGroupId === g.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage
                            src={normalizeImagePath(g.avatar) ?? undefined}
                            alt={g.name}
                          />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {g.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {g.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {g.genre} · {g.members.length} участн.
                          </p>
                        </div>
                        {selectedGroupId === g.id && (
                          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : myGroups.length === 1 ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={normalizeImagePath(musician.avatar) ?? undefined}
                        alt={musician.name}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {myGroups[0].name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {myGroups[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {myGroups[0].genre} · {myGroups[0].members.length}{" "}
                        участн.
                      </p>
                    </div>
                    <Crown className="h-4 w-4 text-warning shrink-0" />
                  </div>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-1 bg-transparent"
                  onClick={() => {
                    setCreatingNew(true);
                    setSelectedGroupId(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Создать новую группу
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Новая группа
                  </p>
                  {myGroups.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setCreatingNew(false);
                        setSelectedGroupId(myGroups[0].id);
                      }}
                    >
                      Выбрать существующую
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-group-name">Название</Label>
                  <Input
                    id="new-group-name"
                    placeholder="Название группы"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-group-genre">Жанр</Label>
                  <Select
                    value={newGroupGenre}
                    onValueChange={setNewGroupGenre}
                  >
                    <SelectTrigger id="new-group-genre">
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-group-desc">Описание</Label>
                  <Textarea
                    id="new-group-desc"
                    placeholder="Краткое описание группы"
                    rows={2}
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Position */}
            <div className="grid gap-2">
              <Label htmlFor="position">Позиция / инструмент</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Выберите инструмент" />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENTS.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                  <SelectItem value="Вокал">Вокал</SelectItem>
                  <SelectItem value="Продюсер">Продюсер</SelectItem>
                  <SelectItem value="Звукорежиссёр">Звукорежиссёр</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="grid gap-2">
              <Label htmlFor="invite-message">Сообщение</Label>
              <Textarea
                id="invite-message"
                placeholder="Напишите пару слов о группе или почему хотите пригласить..."
                rows={3}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleInviteSubmit} disabled={!position}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Отправить приглашение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
