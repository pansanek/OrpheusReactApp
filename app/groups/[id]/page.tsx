'use client';

import { use } from 'react';
import Link from 'next/link';
import { getGroupById, getMusicianById, getPostsByGroupId } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Newspaper, Calendar, Crown, UserPlus, Settings } from 'lucide-react';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useAuth();
  const groupId = parseInt(id);
  const group = getGroupById(groupId);

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Группа не найдена</h1>
        <p className="text-muted-foreground mb-6">Группа с ID {id} не существует</p>
        <Link href="/groups">
          <Button>Вернуться к группам</Button>
        </Link>
      </div>
    );
  }

  const members = group.members.map(id => getMusicianById(id)).filter(Boolean);
  const creator = getMusicianById(group.creatorId);
  const groupPosts = getPostsByGroupId(group.id);
  const isMember = currentUser && group.members.includes(currentUser.id);
  const isCreator = currentUser?.id === group.creatorId;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Group Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getGenreColor(group.genre)}>
                      {group.genre}
                    </Badge>
                    {isMember && (
                      <Badge variant="outline" className="text-primary border-primary">
                        Вы участник
                      </Badge>
                    )}
                  </div>
                </div>
                {isCreator ? (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1.5" />
                    Настройки
                  </Button>
                ) : !isMember && currentUser ? (
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Присоединиться
                  </Button>
                ) : null}
              </div>
              
              <p className="text-foreground mb-4">{group.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.members.length} участников
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Создана {new Date(group.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
        </TabsList>
        
        <TabsContent value="members">
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map(member => member && (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${member.id}`}>
                      <Avatar className="h-12 w-12">
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
                        {member.instruments.join(', ')}
                      </p>
                    </div>
                    {currentUser && member.id !== currentUser.id && (
                      <Button variant="outline" size="sm">
                        Написать
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="posts">
          {groupPosts.length > 0 ? (
            <div className="space-y-4">
              {groupPosts.map(post => {
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
                            {new Date(post.timestamp).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-foreground">{post.content}</p>
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
                <p className="text-muted-foreground">
                  В этой группе ещё никто не публиковал посты
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
