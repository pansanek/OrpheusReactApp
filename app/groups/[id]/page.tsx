"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getMusicianById,
  getPostsByGroupId,
  GENRES,
  INSTRUMENTS,
  type OpenPosition,
  musicians,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Newspaper,
  Calendar,
  Crown,
  UserPlus,
  Settings,
  MapPin,
  Clock,
  Link2,
  X,
  Plus,
  Save,
  Trash2,
  Camera,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { normalizeImagePath } from "@/lib/utils";
import { RequestToJoinDialog } from "@/components/request-to-join-dialog";
import { MusicianCard } from "@/components/musician-card";

export default function GroupPage() {
  const params = useParams();
  const groupId = Number(params?.id);
  const {
    currentUser,
    groupsState,
    updateGroup,
    joinRequests,
    sendJoinRequest,
    acceptJoinRequest,
    declineJoinRequest,
  } = useAuth();
  const group = groupsState.find((g) => g.id === groupId);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    group?.avatar || null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  useEffect(() => {
    setAvatarUrl(group?.avatar || null);
  }, [group?.id, group?.avatar]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setAvatarUrl(url);
        updateGroup(groupId, { avatar: url });
        toast({ title: "Аватар обновлён" });
      };
      reader.onerror = () => {
        toast({ title: "Ошибка загрузки", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    },
    [updateGroup],
  );
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [editPositions, setEditPositions] = useState<OpenPosition[]>([]);
  const [editVk, setEditVk] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [editSoundcloud, setEditSoundcloud] = useState("");
  const [newPositionInstr, setNewPositionInstr] = useState("");
  const [newPositionDesc, setNewPositionDesc] = useState("");

  const openEdit = useCallback(() => {
    if (!group) return;
    setEditName(group.name);
    setEditDescription(group.description);
    setEditGenre(group.genre);
    setEditCity(group.city ?? "");
    setEditSchedule(group.rehearsalSchedule ?? "");
    setEditPositions(group.openPositions ? [...group.openPositions] : []);
    setEditVk(group.socialLinks?.vk ?? "");
    setEditYoutube(group.socialLinks?.youtube ?? "");
    setEditSoundcloud(group.socialLinks?.soundcloud ?? "");
    setNewPositionInstr("");
    setNewPositionDesc("");
    setIsEditOpen(true);
  }, [group]);

  const addPosition = () => {
    if (!newPositionInstr) return;
    setEditPositions((prev) => [
      ...prev,
      {
        instrument: newPositionInstr,
        description: newPositionDesc.trim() || undefined,
      },
    ]);
    setNewPositionInstr("");
    setNewPositionDesc("");
  };

  const removePosition = (index: number) => {
    setEditPositions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = useCallback(() => {
    if (!editName.trim()) {
      toast({ title: "Название обязательно", variant: "destructive" });
      return;
    }
    updateGroup(groupId, {
      name: editName.trim(),
      description: editDescription.trim(),
      genre: editGenre,
      city: editCity.trim(),
      rehearsalSchedule: editSchedule.trim(),
      openPositions: editPositions,
      socialLinks: {
        vk: editVk.trim() || undefined,
        youtube: editYoutube.trim() || undefined,
        soundcloud: editSoundcloud.trim() || undefined,
      },
    });
    setIsEditOpen(false);
    toast({ title: "Данные группы обновлены" });
  }, [
    editName,
    editDescription,
    editGenre,
    editCity,
    editSchedule,
    editPositions,
    editVk,
    editYoutube,
    editSoundcloud,
    groupId,
    updateGroup,
  ]);

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Группа не найдена
        </h1>
        <p className="text-muted-foreground mb-6">
          Группа с ID {groupId} не существует
        </p>
        <Link href="/groups">
          <Button>Вернуться к группам</Button>
        </Link>
      </div>
    );
  }

  const members = group.members
    .map((mid) => getMusicianById(mid))
    .filter(Boolean);
  const creator = getMusicianById(group.creatorId);
  const groupPosts = getPostsByGroupId(group.id);
  const isMember = currentUser && group.members.includes(currentUser.id);
  const isCreator = currentUser?.id === group.creatorId;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Group Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    normalizeImagePath(avatarUrl)
                      ? group.avatar
                        ? group.avatar.startsWith("/")
                          ? group.avatar
                          : `/${group.avatar}`
                        : undefined
                      : undefined
                  }
                  alt={group.name}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                  {group.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isCreator ? (
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
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {group.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className={getGenreColor(group.genre)}>
                      {group.genre}
                    </Badge>
                    {isMember && (
                      <Badge
                        variant="outline"
                        className="text-primary border-primary"
                      >
                        Вы участник
                      </Badge>
                    )}
                  </div>
                </div>
                {isCreator ? (
                  <Button variant="outline" size="sm" onClick={openEdit}>
                    <Settings className="h-4 w-4 mr-1.5" />
                    Настройки
                  </Button>
                ) : !isMember && currentUser ? (
                  <Button size="sm" onClick={() => setRequestDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Присоединиться
                  </Button>
                ) : null}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-4">
                {group.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                {group.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {group.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.members.length} участников
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Создана{" "}
                  {new Date(group.createdAt).toLocaleDateString("ru-RU")}
                </span>
                {group.rehearsalSchedule && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {group.rehearsalSchedule}
                  </span>
                )}
              </div>

              {/* Social links */}
              {group.socialLinks &&
                Object.values(group.socialLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-2">
                    {group.socialLinks.vk && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        VK: {group.socialLinks.vk}
                      </Badge>
                    )}
                    {group.socialLinks.youtube && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        YT: {group.socialLinks.youtube}
                      </Badge>
                    )}
                    {group.socialLinks.soundcloud && (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        SC: {group.socialLinks.soundcloud}
                      </Badge>
                    )}
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      {group.openPositions && group.openPositions.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-primary" />
              Открытые позиции
            </CardTitle>
            <CardDescription>Группа ищет музыкантов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.openPositions.map((pos, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Music2Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {pos.instrument}
                    </p>
                    {pos.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pos.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Участники ({members.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Посты ({groupPosts.length})
          </TabsTrigger>
          {isCreator && (
            <TabsTrigger value="requests" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Запросы ({joinRequests[group.id]?.length ?? 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map(
              (member) =>
                member && (
                  <Card
                    key={member.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/profile/${member.id}`}>
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                member.avatar
                                  ? member.avatar.startsWith("/")
                                    ? member.avatar
                                    : `/${member.avatar}`
                                  : undefined
                              }
                              alt={member.name}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${member.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors truncate"
                            >
                              {member.name}
                            </Link>
                            {member.id === group.creatorId && (
                              <Crown className="h-4 w-4 text-warning shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.instruments.join(", ")}
                          </p>
                        </div>
                        {currentUser && member.id !== currentUser.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent shrink-0"
                          >
                            Написать
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ),
            )}
          </div>
        </TabsContent>

        <TabsContent value="posts">
          {groupPosts.length > 0 ? (
            <div className="space-y-4">
              {groupPosts.map((post) => {
                const author = getMusicianById(post.authorId);
                if (!author) return null;
                return (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${author.id}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(author.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${author.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {author.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.timestamp).toLocaleDateString(
                              "ru-RU",
                            )}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-foreground text-sm">{post.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Пока нет постов
                </h3>
                <p className="text-muted-foreground text-sm">
                  В этой группе ещё никто не публиковал посты
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {isCreator && (
          <TabsContent value="requests">
            {joinRequests[group.id]?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {joinRequests[group.id].map((req) => {
                  const musician = musicians.find((m) => m.id === req.userId);
                  if (!musician) return null;
                  return (
                    <Card
                      key={req.userId}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="p-4 border-b">
                          <MusicianCard
                            musician={musician}
                            showActions={false}
                          />
                        </div>
                        {req.message && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground italic">
                              "{req.message}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(req.createdAt).toLocaleDateString(
                                "ru-RU",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        )}
                        <div className="p-4 border-t bg-muted/20">
                          <div className="flex flex-col gap-3">
                            <Badge variant="outline" className="text-xs">
                              {req.position}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 px-3"
                                onClick={() => {
                                  acceptJoinRequest(group.id, req.userId);
                                }}
                              >
                                Принять
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 bg-transparent"
                                onClick={() => {
                                  declineJoinRequest(group.id, req.userId);
                                }}
                              >
                                Отклонить
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Нет запросов на вступление
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Когда музыканты отправят запросы, они появятся здесь
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Group Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Настройки группы</DialogTitle>
            <DialogDescription>
              Редактируйте информацию о вашей группе
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Basic info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="g-name">Название *</Label>
                <Input
                  id="g-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Жанр</Label>
                <Select value={editGenre} onValueChange={setEditGenre}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="g-desc">Описание</Label>
              <Textarea
                id="g-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                placeholder="Расскажите о группе, её стиле и целях..."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="g-city">Город</Label>
                <Input
                  id="g-city"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Москва"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="g-schedule">Расписание репетиций</Label>
                <Input
                  id="g-schedule"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  placeholder="Пн, Ср в 19:00"
                />
              </div>
            </div>

            <Separator />

            {/* Open positions */}
            <div className="grid gap-3">
              <Label>Открытые позиции</Label>

              {editPositions.length > 0 && (
                <div className="grid gap-2">
                  {editPositions.map((pos, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                    >
                      <span className="font-medium text-sm text-foreground flex-1">
                        {pos.instrument}
                      </span>
                      {pos.description && (
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                          {pos.description}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePosition(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-2 p-3 border border-dashed rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Добавить позицию
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select
                    value={newPositionInstr}
                    onValueChange={setNewPositionInstr}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Инструмент..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENTS.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newPositionDesc}
                    onChange={(e) => setNewPositionDesc(e.target.value)}
                    placeholder="Описание (необязательно)"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPosition}
                  disabled={!newPositionInstr}
                  className="bg-transparent w-fit"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
            </div>

            <Separator />

            {/* Social links */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Социальные сети
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="g-vk"
                    className="text-xs text-muted-foreground"
                  >
                    VK
                  </Label>
                  <Input
                    id="g-vk"
                    value={editVk}
                    onChange={(e) => setEditVk(e.target.value)}
                    placeholder="group_vk"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="g-yt"
                    className="text-xs text-muted-foreground"
                  >
                    YouTube
                  </Label>
                  <Input
                    id="g-yt"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    placeholder="mychannel"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="g-sc"
                    className="text-xs text-muted-foreground"
                  >
                    SoundCloud
                  </Label>
                  <Input
                    id="g-sc"
                    value={editSoundcloud}
                    onChange={(e) => setEditSoundcloud(e.target.value)}
                    placeholder="soundcloud"
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

      <RequestToJoinDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        groupId={group.id}
        groupName={group.name}
        groupCreatorId={group.creatorId}
      />
    </div>
  );
}

// Small inline icon component to avoid import issues
function Music2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="18" r="4" />
      <path d="M12 18V2l7 4" />
    </svg>
  );
}
