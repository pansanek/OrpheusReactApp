'use client';

import { useState, useMemo } from 'react';
import { musicians, INSTRUMENTS, GENRES, searchMusicians } from '@/lib/mock-data';
import { MusicianCard } from '@/components/musician-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Users } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [instrument, setInstrument] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [location, setLocation] = useState('');
  const [minSkillLevel, setMinSkillLevel] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMusicians = useMemo(() => {
    let results = searchMusicians({
      instrument: instrument || undefined,
      genre: genre || undefined,
      location: location || undefined,
      minSkillLevel: minSkillLevel ? parseInt(minSkillLevel) : undefined,
    });

    // Additional text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.instruments.some(i => i.toLowerCase().includes(query)) ||
        m.genres.some(g => g.toLowerCase().includes(query)) ||
        m.bio.toLowerCase().includes(query)
      );
    }

    return results;
  }, [searchQuery, instrument, genre, location, minSkillLevel]);

  const hasFilters = instrument || genre || location || minSkillLevel;

  const clearFilters = () => {
    setInstrument('');
    setGenre('');
    setLocation('');
    setMinSkillLevel('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Поиск музыкантов</h1>
        <p className="text-muted-foreground">
          Найдите партнёров для совместных проектов
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по имени, инструменту, жанру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasFilters && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {[instrument, genre, location, minSkillLevel].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-border">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Инструмент
                  </label>
                  <Select value={instrument} onValueChange={setInstrument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENTS.map(inst => (
                        <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Жанр
                  </label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Город
                  </label>
                  <Input
                    placeholder="Введите город"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Минимальный уровень
                  </label>
                  <Select value={minSkillLevel} onValueChange={setMinSkillLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 звезда</SelectItem>
                      <SelectItem value="2">2 звезды</SelectItem>
                      <SelectItem value="3">3 звезды</SelectItem>
                      <SelectItem value="4">4 звезды</SelectItem>
                      <SelectItem value="5">5 звёзд</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Сбросить фильтры
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredMusicians.length} музыкантов
        </p>
      </div>

      {filteredMusicians.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMusicians.map(musician => (
            <MusicianCard key={musician.id} musician={musician} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Музыканты не найдены
            </h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры поиска
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
