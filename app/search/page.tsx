"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  INSTRUMENTS,
  GENRES,
  USER_ROLES,
  searchMusicians,
} from "@/lib/mock-data";
import { MusicianCard } from "@/components/musician-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  musician: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  teacher: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  venue_admin:
    "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  producer:
    "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  sound_engineer: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  journalist: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
};

export default function SearchPage() {
  const { allUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [instrument, setInstrument] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [location, setLocation] = useState("");
  const [minSkillLevel, setMinSkillLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Instrument/genre filters only make sense for musicians
  const showMusicianFilters = !selectedRole || selectedRole === "musician";

  const filteredUsers = useMemo(() => {
    let results = searchMusicians({
      instrument: showMusicianFilters && instrument ? instrument : undefined,
      genre: showMusicianFilters && genre ? genre : undefined,
      location: location || undefined,
      minSkillLevel: minSkillLevel ? parseInt(minSkillLevel) : undefined,
      role: selectedRole || undefined,
    });

    // Merge with allUsers so newly registered accounts show up
    const staticIds = new Set(results.map((u) => u.id));
    const dynamicExtra = allUsers.filter((u) => {
      if (staticIds.has(u.id)) return false;
      if (selectedRole && u.role !== selectedRole) return false;
      return true;
    });
    results = [...results, ...dynamicExtra];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.instruments.some((i) => i.toLowerCase().includes(q)) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.bio.toLowerCase().includes(q) ||
          (m.location ?? "").toLowerCase().includes(q) ||
          USER_ROLES.find((r) => r.id === m.role)
            ?.label.toLowerCase()
            .includes(q),
      );
    }

    return results;
  }, [
    searchQuery,
    selectedRole,
    instrument,
    genre,
    location,
    minSkillLevel,
    showMusicianFilters,
    allUsers,
  ]);

  const activeFilterCount = [
    selectedRole,
    instrument,
    genre,
    location,
    minSkillLevel,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedRole("");
    setInstrument("");
    setGenre("");
    setLocation("");
    setMinSkillLevel("");
  };

  const roleLabel = selectedRole
    ? USER_ROLES.find((r) => r.id === selectedRole)?.label
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Поиск</h1>
        <p className="text-muted-foreground">
          Найдите музыкантов, преподавателей, продюсеров и других участников
          музыкального сообщества
        </p>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedRole("")}
          className={cn(
            "inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
            !selectedRole
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted",
          )}
        >
          Все
        </button>
        {USER_ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() =>
              setSelectedRole((prev) => (prev === role.id ? "" : role.id))
            }
            className={cn(
              "inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
              selectedRole === role.id
                ? "bg-primary text-primary-foreground border-primary"
                : cn(
                    "bg-background border-border",
                    ROLE_COLORS[role.id] ??
                      "hover:bg-muted text-muted-foreground",
                  ),
            )}
          >
            {role.label}
          </button>
        ))}
      </div>

      {/* Search bar + filters toggle */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={
                  selectedRole === "musician"
                    ? "Поиск по имени, инструменту, жанру..."
                    : selectedRole === "teacher"
                      ? "Поиск по имени, дисциплинам, городу..."
                      : "Поиск по имени, роли, городу..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className="shrink-0 bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-border">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Role select (mirrors pill but inside panel for convenience) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Тип участника
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Instrument — only relevant for musicians */}
                <div
                  className={cn(
                    !showMusicianFilters && "opacity-40 pointer-events-none",
                  )}
                >
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Инструмент
                  </label>
                  <Select value={instrument} onValueChange={setInstrument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENTS.map((inst) => (
                        <SelectItem key={inst} value={inst}>
                          {inst}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre — only relevant for musicians */}
                <div
                  className={cn(
                    !showMusicianFilters && "opacity-40 pointer-events-none",
                  )}
                >
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Жанр
                  </label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
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
                  <Select
                    value={minSkillLevel}
                    onValueChange={setMinSkillLevel}
                  >
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

              {activeFilterCount > 0 && (
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

      {/* Results header */}
      <div className="mb-4 flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Найдено:{" "}
          <span className="font-medium text-foreground">
            {filteredUsers.length}
          </span>{" "}
          {roleLabel
            ? roleLabel.toLowerCase() + (filteredUsers.length === 1 ? "" : "ов")
            : "участников"}
        </p>
        {selectedRole && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => setSelectedRole("")}
          >
            {roleLabel}
            <X className="h-3 w-3 ml-1" />
          </Badge>
        )}
      </div>

      {/* Results grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <MusicianCard key={user.id} musician={user} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Участники не найдены
            </h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-transparent"
              >
                Сбросить фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
