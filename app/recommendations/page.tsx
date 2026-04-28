"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getRecommendations } from "@/lib/mock-data";
import { MusicianCard } from "@/components/musician-card";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  if (!currentUser) {
    router.push("/login");
    return null;
  }

  const recommendations = getRecommendations(currentUser.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Рекомендации для вас
          </h1>
        </div>
        <p className="text-muted-foreground">
          Персонализированные предложения на основе ваших интересов и тегов ИИ
        </p>
      </div>

      {/* How it works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Как работают рекомендации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Жанры и инструменты
                </p>
                <p className="text-sm text-muted-foreground">
                  Ищем музыкантов с похожими музыкальными предпочтениями
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Теги ИИ</p>
                <p className="text-sm text-muted-foreground">
                  Учитываем ваши интересы: джемы, гастроли, студийная работа
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Геолокация</p>
                <p className="text-sm text-muted-foreground">
                  Приоритет музыкантам из вашего города
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No tags warning */}
      {currentUser.aiTags.length === 0 && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  Добавьте теги для лучших рекомендаций
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Расскажите системе о своих интересах, чтобы получать более
                  точные предложения
                </p>
                <Button asChild size="sm">
                  <Link href="/ai-tags">Добавить теги</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(({ musician, score }) => (
            <MusicianCard key={musician.id} musician={musician} score={score} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Пока нет рекомендаций
            </h3>
            <p className="text-muted-foreground mb-4">
              Добавьте больше информации в профиль и теги ИИ
            </p>
            <Button asChild>
              <Link href="/ai-tags">Настроить теги</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
