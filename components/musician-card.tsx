'use client';

import Link from 'next/link';
import type { Musician } from '@/lib/mock-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, MessageCircle, UserPlus } from 'lucide-react';

interface MusicianCardProps {
  musician: Musician;
  showActions?: boolean;
  score?: number;
}

export function MusicianCard({ musician, showActions = true, score }: MusicianCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-[var(--status-online)]';
      case 'busy': return 'bg-[var(--status-busy)]';
      case 'recording': return 'bg-[var(--status-recording)] animate-pulse';
      default: return 'bg-[var(--status-offline)]';
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(musician.name)}
              </AvatarFallback>
            </Avatar>
            <span className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(musician.status)} border-2 border-card rounded-full`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link 
                href={`/profile/${musician.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {musician.name}
              </Link>
              {score !== undefined && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {Math.round(score * 100)}% совпадение
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-0.5">
              {musician.instruments.join(' • ')}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {musician.location}
              </span>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < musician.skillLevel ? 'fill-warning text-warning' : 'text-muted'}`}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {musician.genres.map(genre => (
            <Badge key={genre} className={`${getGenreColor(genre)} text-xs`}>
              {genre}
            </Badge>
          ))}
        </div>
        
        {musician.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {musician.bio}
          </p>
        )}
        
        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Написать
            </Button>
            <Button size="sm" className="flex-1">
              <UserPlus className="h-4 w-4 mr-1.5" />
              В группу
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
