"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  createGroupSchema,
  type CreateGroupFormValues,
} from "@/lib/validations/group";
import { GENRES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Music,
  MapPin,
  CalendarDays,
  Link as LinkIcon,
  Users,
  Upload,
  Check,
  X,
} from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const { currentUser, createGroup, allUsers } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      genre: "",
      city: "",
      rehearsalSchedule: "",
      socialLinks: { vk: "", youtube: "", soundcloud: "" },
      openPositions: [],
      avatar: "",
      invites: [],
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      form.setValue("avatar", url, { shouldValidate: true });
    }
  };

  const toggleOpenPosition = (instrument: string) => {
    const current = form.getValues("openPositions");
    const updated = current.includes(instrument)
      ? current.filter((i) => i !== instrument)
      : [...current, instrument];
    form.setValue("openPositions", updated);
  };

  const onSubmit = async (data: CreateGroupFormValues) => {
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      const invalidInvites = data.invites.some((inv) => !inv.position.trim());
      if (invalidInvites) {
        toast({
          title: "Заполните позиции",
          description:
            "Для каждого приглашённого участника нужно выбрать инструмент или роль.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const newGroupId = createGroup(data);
      onOpenChange(false);
      form.reset();
      setAvatarPreview("");
      router.push(`/groups/${newGroupId}`);
      router.refresh();
    } catch (error) {
      console.error("Ошибка создания группы:", error);
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      toast({
        title: "Ошибка создания группы",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать группу</DialogTitle>
          <DialogDescription>
            Заполните основные параметры проекта. Поля с * обязательны.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-5 py-2"
        >
          {/* Аватар */}
          <div className="flex flex-col items-center gap-2">
            <Label className="text-xs text-muted-foreground">
              Аватар группы
            </Label>
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/30">
                <AvatarImage src={avatarPreview} alt="Preview" />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <Music className="h-8 w-8 opacity-50" />
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/90"
                  onClick={() => {
                    setAvatarPreview("");
                    form.setValue("avatar", "");
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Основные поля */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название группы *</Label>
              <Input
                id="name"
                placeholder="The Midnight Echo"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Жанр *</Label>
                <Select
                  onValueChange={(v) =>
                    form.setValue("genre", v, { shouldValidate: true })
                  }
                  value={form.watch("genre")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите жанр" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.genre && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.genre.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Город
                </Label>
                <Input placeholder="Москва" {...form.register("city")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Описание / Концепт</Label>
              <Textarea
                id="description"
                placeholder="Расскажите о звучании, целях и репертуаре..."
                rows={3}
                {...form.register("description")}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.watch("description")?.length || 0}/500
              </p>
            </div>
          </div>

          {/* График и соцсети */}
          <div className="grid gap-4 border-t pt-4">
            <Label className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> График и соцсети
            </Label>

            <div className="grid gap-2">
              <Label>График репетиций</Label>
              <Input
                placeholder="Вт, Чт 19:00-21:00"
                {...form.register("rehearsalSchedule")}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">VK</Label>
                <Input
                  placeholder="https://vk.com/..."
                  {...form.register("socialLinks.vk")}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">YouTube</Label>
                <Input
                  placeholder="https://youtube.com/..."
                  {...form.register("socialLinks.youtube")}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">SoundCloud</Label>
                <Input
                  placeholder="https://soundcloud.com/..."
                  {...form.register("socialLinks.soundcloud")}
                />
              </div>
            </div>
          </div>

          {/* Ищу участников */}
          <div className="grid gap-3 border-t pt-4">
            <Label className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Пригласить участников{" "}
              <span className="text-muted-foreground font-normal">
                (опционально)
              </span>
            </Label>

            <div className="max-h-44 overflow-y-auto border rounded-md bg-muted/10 divide-y">
              {allUsers
                .filter((m) => m.id !== currentUser.id)
                .map((m) => {
                  const invite = form
                    .watch("invites")
                    .find((i) => i.userId === m.id);
                  const isInvited = !!invite;

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2.5 hover:bg-muted/30 transition-colors"
                    >
                      {/* Чекбокс выбора */}
                      <Checkbox
                        checked={isInvited}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            form.setValue("invites", [
                              ...form.getValues("invites"),
                              { userId: m.id, position: "" },
                            ]);
                          } else {
                            form.setValue(
                              "invites",
                              form
                                .getValues("invites")
                                .filter((i) => i.userId !== m.id),
                            );
                          }
                        }}
                      />

                      {/* Аватар + Имя */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage
                            src={normalizeImagePath(m.avatar) ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {m.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {m.name}
                        </span>
                      </div>

                      {/* Селектор позиции (появляется только при отметке) */}
                      {isInvited && (
                        <Select
                          value={invite.position}
                          onValueChange={(val) => {
                            const updated = form
                              .getValues("invites")
                              .map((i) =>
                                i.userId === m.id ? { ...i, position: val } : i,
                              );
                            form.setValue("invites", updated);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[130px] bg-background">
                            <SelectValue placeholder="Позиция" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Вокал",
                              "Гитара",
                              "Бас-гитара",
                              "Ударные",
                              "Клавиши",
                              "Скрипка",
                              "Саксофон",
                              "Продюсер",
                              "Звукорежиссёр",
                            ].map((pos) => (
                              <SelectItem key={pos} value={pos}>
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
            </div>

            {form.watch("invites").length > 0 && (
              <p className="text-xs text-muted-foreground">
                Выбрано: {form.watch("invites").length} • Не забудьте указать
                позиции
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создаём..." : "Создать группу"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
