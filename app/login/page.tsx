"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { musicians } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    router.push("/");
    return null;
  }

  const handleLogin = (userId: number) => {
    login(userId);
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Вход в ORPHEUS
          </h1>
          <p className="text-muted-foreground">
            Выберите профиль для демонстрации (MVP-версия)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Доступные профили</CardTitle>
            <CardDescription>
              Нажмите на карточку музыканта, чтобы войти под его аккаунтом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {musicians.map((musician) => (
                <button
                  key={musician.id}
                  onClick={() => handleLogin(musician.id)}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted hover:border-primary transition-colors text-left w-full"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      {musician.avatar ? (
                        <AvatarImage
                          src={musician.avatar}
                          alt={musician.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(musician.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
                        musician.status,
                      )} border-2 border-card rounded-full`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {musician.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {musician.instruments.join(", ")}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {musician.genres.slice(0, 2).map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="text-xs"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          В полной версии здесь будет форма регистрации и авторизации
        </p>
      </div>
    </div>
  );
}
