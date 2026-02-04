'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { groups, getMusicianById, getGroupsByMusicianId, GENRES } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Search, Music } from 'lucide-react';

export default function GroupsPage() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const myGroups = currentUser ? getGroupsByMusicianId(currentUser.id) : [];
  const allGroups = groups.filter(g => 
    !searchQuery || 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

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

  const GroupCard = ({ group }: { group: typeof groups[0] }) => {
    const members = group.members.map(id => getMusicianById(id)).filter(Boolean);
    const isMember = currentUser && group.members.includes(currentUser.id);

    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                {getInitials(group.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link href={`/groups/${group.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors">
                  {group.name}
                </CardTitle>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getGenreColor(group.genre)}>
                  {group.genre}
                </Badge>
                {isMember && (
                  <Badge variant="outline" className="text-primary border-primary">
                    Участник
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {group.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map(member => member && (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {group.members.length} участников
              </span>
            </div>
            
            <Button asChild variant="outline" size="sm">
              <Link href={`/groups/${group.id}`}>
                Открыть
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Группы</h1>
          <p className="text-muted-foreground">
            Создавайте коллективы и работайте над проектами вместе
          </p>
        </div>
        
        {currentUser && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать группу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создание новой группы</DialogTitle>
                <DialogDescription>
                  Заполните информацию о вашем музыкальном коллективе
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Название группы</label>
                  <Input placeholder="Введите название" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Жанр</label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea 
                    placeholder="Расскажите о своей группе..."
                    className="mt-1.5"
                  />
                </div>
                <Button className="w-full" onClick={() => setIsCreateOpen(false)}>
                  Создать группу
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Поиск групп..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {currentUser ? (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              Все группы ({allGroups.length})
            </TabsTrigger>
            <TabsTrigger value="my">
              Мои группы ({myGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {allGroups.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Группы не найдены</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my">
            {myGroups.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Вы пока не состоите ни в одной группе
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте свою группу или присоединитесь к существующей
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать группу
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
