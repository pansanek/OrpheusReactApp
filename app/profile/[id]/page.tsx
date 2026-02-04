'use client';

import { use } from 'react';
import Link from 'next/link';
import { getMusicianById, getGroupsByMusicianId, getPostsByAuthorId, AI_TAG_CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Music, Users, Newspaper, MessageCircle, UserPlus, Sparkles } from 'lucide-react';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useAuth();
  const musicianId = parseInt(id);
  const musician = getMusicianById(musicianId);

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

  // Redirect to own profile page if viewing own profile
  const isOwnProfile = currentUser?.id === musician.id;

  const userGroups = getGroupsByMusicianId(musician.id);
  const userPosts = getPostsByAuthorId(musician.id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
              <span className={`absolute bottom-1 right-1 w-5 h-5 ${getStatusColor(musician.status)} border-3 border-card rounded-full`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{musician.name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(musician.status)}`} />
                    {getStatusText(musician.status)}
                  </p>
                </div>
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Написать
                    </Button>
                    <Button size="sm">
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
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
              
              {musician.bio && (
                <p className="text-foreground">{musician.bio}</p>
              )}
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
                    color: getTagCategoryColor(tag.category)
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

      {/* Tabs: Groups and Posts */}
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
    </div>
  );
}
