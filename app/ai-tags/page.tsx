"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AI_TAG_CATEGORIES } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Plus, X, Info, Lightbulb } from "lucide-react";

const tagSuggestions = [
  { text: "Ищу группу", category: "collaboration" },
  { text: "Джем-сессии", category: "activity" },
  { text: "Готов к концертам", category: "activity" },
  { text: "Студийная работа", category: "skill" },
  { text: "Онлайн-коллаборации", category: "collaboration" },
  { text: "Преподавание", category: "skill" },
  { text: "Ищу вокалиста", category: "collaboration" },
  { text: "Ищу барабанщика", category: "collaboration" },
  { text: "Центр города", category: "location" },
  { text: "Записываю каверы", category: "goal" },
  { text: "Пишу авторский материал", category: "goal" },
  { text: "Готов к гастролям", category: "activity" },
];

export default function AITagsPage() {
  const router = useRouter();
  const { currentUser, addAITag, removeAITag } = useAuth();
  const [newTagText, setNewTagText] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");

  if (!currentUser) {
    router.push("/login");
    return null;
  }

  const handleAddTag = () => {
    if (newTagText.trim() && newTagCategory) {
      addAITag({ text: newTagText.trim(), category: newTagCategory });
      setNewTagText("");
      setNewTagCategory("");
    }
  };

  const handleAddSuggestion = (suggestion: (typeof tagSuggestions)[0]) => {
    const exists = currentUser.aiTags.some(
      (t) => t.text.toLowerCase() === suggestion.text.toLowerCase(),
    );
    if (!exists) {
      addAITag(suggestion);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = AI_TAG_CATEGORIES.find((c) => c.id === categoryId);
    return category?.color || "#6C757D";
  };

  const getCategoryName = (categoryId: string) => {
    const category = AI_TAG_CATEGORIES.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Теги для ИИ</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Эти теги помогают системе подбирать вам подходящих партнёров и
        показывать релевантные рекомендации
      </p>

      {/* Info Card */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Как работают теги
              </p>
              <p className="text-sm text-muted-foreground">
                Добавляйте теги, описывающие ваши интересы и цели. Система будет
                использовать их для поиска музыкантов с похожими интересами и
                показа персонализированных рекомендаций.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Tags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ваши теги</CardTitle>
          <CardDescription>
            {currentUser.aiTags.length > 0
              ? `У вас ${currentUser.aiTags.length} тегов`
              : "У вас пока нет тегов"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser.aiTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentUser.aiTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="py-1.5 px-3 rounded-full text-sm"
                  style={{
                    borderColor: getCategoryColor(tag.category),
                    color: getCategoryColor(tag.category),
                  }}
                >
                  {tag.text}
                  <button
                    onClick={() => removeAITag(tag.id)}
                    className="ml-2 hover:opacity-70 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Добавьте теги, чтобы получать лучшие рекомендации
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Tag */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Добавить тег</CardTitle>
          <CardDescription>
            Создайте новый тег для улучшения рекомендаций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Текст тега..."
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              className="flex-1"
            />
            <Select value={newTagCategory} onValueChange={setNewTagCategory}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {AI_TAG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddTag}
              disabled={!newTagText.trim() || !newTagCategory}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Популярные теги
          </CardTitle>
          <CardDescription>
            Нажмите на тег, чтобы добавить его в свой список
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map((suggestion, index) => {
              const isAdded = currentUser.aiTags.some(
                (t) => t.text.toLowerCase() === suggestion.text.toLowerCase(),
              );
              return (
                <button
                  key={index}
                  onClick={() => handleAddSuggestion(suggestion)}
                  disabled={isAdded}
                  className={`
                    py-1.5 px-3 rounded-full text-sm border transition-all
                    ${
                      isAdded
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : "hover:scale-105 hover:shadow-sm cursor-pointer"
                    }
                  `}
                  style={{
                    borderColor: getCategoryColor(suggestion.category),
                    color: isAdded
                      ? undefined
                      : getCategoryColor(suggestion.category),
                  }}
                >
                  {suggestion.text}
                  {!isAdded && <Plus className="h-3 w-3 ml-1.5 inline" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Categories Legend */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium text-foreground mb-3">
          Категории тегов:
        </p>
        <div className="flex flex-wrap gap-4">
          {AI_TAG_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-muted-foreground">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
