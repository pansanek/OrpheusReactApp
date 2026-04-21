'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, Search, MapPin, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Поиск музыкантов',
    description: 'Найдите единомышленников по инструменту, жанру и уровню мастерства',
  },
  {
    icon: Users,
    title: 'Создание групп',
    description: 'Объединяйтесь в коллективы и работайте над проектами вместе',
  },
  {
    icon: MapPin,
    title: 'Каталог учреждений',
    description: 'Найдите и забронируйте студию или концертную площадку',
  },
  {
    icon: Sparkles,
    title: 'Умные рекомендации',
    description: 'ИИ подберёт вам идеальных партнёров на основе ваших интересов',
  },
];

export default function HomePage() {
  const { currentUser } = useAuth();

  // Logged in user dashboard
  if (currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Привет, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать обратно в УМПСМ
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Найти музыкантов
              </CardTitle>
              <CardDescription>
                Ищите партнёров для совместных проектов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/search">
                  Начать поиск
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Рекомендации
              </CardTitle>
              <CardDescription>
                Персональные предложения от ИИ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/recommendations">
                  Посмотреть
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Мои группы
              </CardTitle>
              <CardDescription>
                Управляйте своими музыкальными коллективами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/groups">
                  Перейти к группам
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Найти студию
              </CardTitle>
              <CardDescription>
                Забронируйте место для репетиции
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/venues">
                  Каталог учреждений
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Landing page for guests
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Социальная сеть для музыкантов</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Найди своих
            <span className="text-primary"> музыкальных </span>
            единомышленников
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            УМПСМ объединяет музыкантов, помогает формировать группы и находить площадки для репетиций и выступлений
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/login">
                Начать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
              <Link href="/search">
                Посмотреть музыкантов
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Всё для музыкантов в одном месте
          </h2>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Готовы найти свою группу мечты?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Присоединяйтесь к сообществу музыкантов уже сегодня
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link href="/login">
              Присоединиться
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
