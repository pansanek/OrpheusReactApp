'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getMusicianById, getGroupsByMusicianId, getPostsByAuthorId, AI_TAG_CATEGORIES, groups, INSTRUMENTS, GENRES } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Star, MapPin, Music, Users, Newspaper, MessageCircle,
  UserPlus, Sparkles, Plus, ChevronRight, Crown
} from 'lucide-react';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { currentUser, sendGroupInvite } = useAuth();
  const musicianId = parseInt(id);
  const musician = getMusicianById(musicianId);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGenre, setNewGroupGenre] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [position, setPosition] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  if (!musician) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Музыкант не найден</h1>
        <p className="text-muted-foreground mb-6">Профиль с ID {id} не существует</p>
        <Link href="/search">
          <Button>Найти музыкантов</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === musician.id;
  const userGroups = getGroupsByMusicianId(musician.id);
  const userPosts = getPostsByAuthorId(musician.id);

  // Current user's groups (as creator or member)
  const myGroups = currentUser
    ? groups.filter(g => g.members.includes(currentUser.id))
    : [];

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-[var(--status-online)]';
      case 'busy': return 'bg-[var(--status-busy)]';
      case 'recording': return 'bg-[var(--status-recording)]';
      default: return 'bg-[var(--status-offline)]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'В сети';
      case 'busy': return 'Занят';
      case 'recording': return 'В студии';
      default: return 'Не в сети';
    }
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Рок': 'bg-[var(--genre-rock)] text-white',
      'Джаз': 'bg-[var(--genre-jazz)] text-white',
      'Классика': 'bg-[var(--genre-classical)] text-black',
      'Электроника': 'bg-[var(--genre-electronic)] text-white',
      'Поп': 'bg-[var(--genre-pop)] text-white',
      'Хип-хоп': 'bg-[var(--genre-hiphop)] text-white',
    };
    return colors[genre] || 'bg-muted text-muted-foreground';
  };

  const getTagCategoryColor = (category: string) => {
    const cat = AI_TAG_CATEGORIES.find(c => c.id === category);
    return cat?.color || '#6C757D';
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
    if (!currentUser) return;
    if (!creatingNew && !selectedGroupId) {
      toast({ title: 'Выберите группу', variant: 'destructive' });
      return;
    }
    if (creatingNew && !newGroupName.trim()) {
      toast({ title: 'Укажите название группы', variant: 'destructive' });
      return;
    }
    if (!position.trim()) {
      toast({ title: 'Укажите позицию', variant: 'destructive' });
      return;
    }

    sendGroupInvite({
      toUserId: musician.id,
      groupId: creatingNew ? null : selectedGroupId,
      newGroupData: creatingNew
        ? { name: newGroupName, genre: newGroupGenre, description: newGroupDescription }
        : undefined,
      position,
      message: inviteMessage,
    });

    toast({
      title: 'Приглашение отправлено!',
      description: `${musician.name} получит уведомление с вашим приглашением.`,
    });

    // Reset
    setInviteOpen(false);
    setSelectedGroupId(null);
    setCreatingNew(false);
    setNewGroupName('');
    setNewGroupGenre('');
    setNewGroupDescription('');
    setPosition('');
    setInviteMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(musician.name)}
                </AvatarFallback>
              </Avatar>
              <span className={`absolute bottom-1 right-1 w-5 h-5 ${getStatusColor(musician.status)} border-2 border-card rounded-full`} />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{musician.name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(musician.status)}`} />
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
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      В группу
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
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {musician.instruments.join(', ')}
                </span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < musician.skillLevel ? 'fill-warning text-warning' : 'text-muted'}`}
                    />
                  ))}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {musician.genres.map(genre => (
                  <Badge key={genre} className={getGenreColor(genre)}>
                    {genre}
                  </Badge>
                ))}
              </div>

              {musician.bio && <p className="text-foreground">{musician.bio}</p>}
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
              {musician.aiTags.map(tag => (
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
              {userGroups.map(group => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {group.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <CardDescription>{group.genre}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {group.description}
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
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
                <p className="text-muted-foreground">Музыкант ещё не состоит в группах</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts">
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map(post => (
                <Card key={post.id}>
                  <CardContent className="py-4">
                    <p className="text-foreground mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(post.timestamp).toLocaleDateString('ru-RU')}</span>
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
                <p className="text-muted-foreground">У музыканта ещё нет постов</p>
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
              Выберите свою группу или создайте новую, укажите позицию для{' '}
              <span className="font-medium text-foreground">{musician.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Group selection */}
            {!creatingNew ? (
              <div className="grid gap-2">
                <Label>Группа</Label>
                {myGroups.length > 1 ? (
                  <div className="grid gap-2">
                    {myGroups.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroupId(g.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                          selectedGroupId === g.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {g.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.genre} · {g.members.length} участн.</p>
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
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {myGroups[0].name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{myGroups[0].name}</p>
                      <p className="text-xs text-muted-foreground">{myGroups[0].genre} · {myGroups[0].members.length} участн.</p>
                    </div>
                    <Crown className="h-4 w-4 text-warning shrink-0" />
                  </div>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-1 bg-transparent"
                  onClick={() => { setCreatingNew(true); setSelectedGroupId(null); }}
                >
                  <Plus className="h-4 w-4" />
                  Создать новую группу
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Новая группа</p>
                  {myGroups.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setCreatingNew(false); setSelectedGroupId(myGroups[0].id); }}
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
                    onChange={e => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-group-genre">Жанр</Label>
                  <Select value={newGroupGenre} onValueChange={setNewGroupGenre}>
                    <SelectTrigger id="new-group-genre">
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
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
                    onChange={e => setNewGroupDescription(e.target.value)}
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
                  {INSTRUMENTS.map(inst => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
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
                onChange={e => setInviteMessage(e.target.value)}
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
