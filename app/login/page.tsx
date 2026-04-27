"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  GraduationCap,
  Building2,
  Mic2,
  Sliders,
  Newspaper,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Check,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { INSTRUMENTS, GENRES, VENUE_TYPES } from "@/lib/constants";
import {
  TeacherProfile,
  ProducerProfile,
  SoundEngineerProfile,
  JournalistProfile,
  UserRole,
  Musician,
  USER_ROLES,
} from "@/lib/types";

// --- Иконки ролей ---
const ROLE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  musician: Music,
  teacher: GraduationCap,
  venue_admin: Building2,
  producer: Mic2,
  sound_engineer: Sliders,
  journalist: Newspaper,
};

// --- Вспомогательные компоненты ---

function TagInput({
  label,
  placeholder,
  values,
  onChange,
  suggestions,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: readonly string[];
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => add(input)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange([...values, s])}
                className="text-xs px-2 py-1 rounded-full border border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 pr-1">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            value >= s
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-primary/20",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// --- Шаги регистрации ---

type Step = "mode" | "role" | "base" | "role_details" | "done";

interface BaseForm {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  instruments: string[];
  genres: string[];
  skillLevel: number;
}

const emptyBase: BaseForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  instruments: [],
  genres: [],
  skillLevel: 3,
};

// --- Форма деталей по ролям ---

function MusicianDetails({
  base,
  setBase,
}: {
  base: BaseForm;
  setBase: (b: BaseForm) => void;
}) {
  return (
    <div className="space-y-5">
      <TagInput
        label="Инструменты"
        placeholder="Добавить инструмент"
        values={base.instruments}
        onChange={(v) => setBase({ ...base, instruments: v })}
        suggestions={INSTRUMENTS}
      />
      <TagInput
        label="Жанры"
        placeholder="Добавить жанр"
        values={base.genres}
        onChange={(v) => setBase({ ...base, genres: v })}
        suggestions={GENRES}
      />
      <div className="space-y-2">
        <Label>Уровень мастерства</Label>
        <StarRating
          value={base.skillLevel}
          onChange={(v) => setBase({ ...base, skillLevel: v })}
        />
        <p className="text-xs text-muted-foreground">
          {
            [
              "",
              "Начинающий",
              "Любитель",
              "Средний уровень",
              "Продвинутый",
              "Профессионал",
            ][base.skillLevel]
          }
        </p>
      </div>
    </div>
  );
}

function TeacherDetails({
  data,
  setData,
}: {
  data: Partial<TeacherProfile>;
  setData: (d: Partial<TeacherProfile>) => void;
}) {
  const formats = ["Офлайн", "Онлайн", "Выезд к ученику"];
  const ages = ["Дети (5-12)", "Подростки (13-17)", "Взрослые (18+)"];

  return (
    <div className="space-y-5">
      <TagInput
        label="Преподаваемые дисциплины"
        placeholder="Напр., Гитара, Сольфеджио..."
        values={data.subjects ?? []}
        onChange={(v) => setData({ ...data, subjects: v })}
        suggestions={INSTRUMENTS}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Опыт преподавания (лет)</Label>
          <Input
            type="number"
            min={0}
            value={data.experience ?? ""}
            onChange={(e) =>
              setData({ ...data, experience: Number(e.target.value) })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Стоимость урока (₽/час)</Label>
          <Input
            type="number"
            min={0}
            value={data.pricePerHour ?? ""}
            onChange={(e) =>
              setData({ ...data, pricePerHour: Number(e.target.value) })
            }
            placeholder="1500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Образование</Label>
        <Input
          value={data.education ?? ""}
          onChange={(e) => setData({ ...data, education: e.target.value })}
          placeholder="Музыкальная школа, консерватория..."
        />
      </div>
      <div className="space-y-2">
        <Label>Формат занятий</Label>
        <div className="flex flex-wrap gap-2">
          {formats.map((f) => {
            const active = (data.lessonFormats ?? []).includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    lessonFormats: active
                      ? (data.lessonFormats ?? []).filter((x) => x !== f)
                      : [...(data.lessonFormats ?? []), f],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Возрастные группы</Label>
        <div className="flex flex-wrap gap-2">
          {ages.map((a) => {
            const active = (data.ageGroups ?? []).includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    ageGroups: active
                      ? (data.ageGroups ?? []).filter((x) => x !== a)
                      : [...(data.ageGroups ?? []), a],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
      <TagInput
        label="Сертификаты и дипломы"
        placeholder="Добавить документ"
        values={data.certificates ?? []}
        onChange={(v) => setData({ ...data, certificates: v })}
      />
    </div>
  );
}

function VenueDetails({
  data,
  setData,
}: {
  data: {
    venueName: string;
    venueType: string;
    address: string;
    pricePerHour: string;
    equipment: string[];
    description: string;
  };
  setData: (d: typeof data) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Название площадки</Label>
        <Input
          value={data.venueName}
          onChange={(e) => setData({ ...data, venueName: e.target.value })}
          placeholder="Студия «Звук», Репбаза «Гараж»..."
        />
      </div>
      <div className="space-y-2">
        <Label>Тип площадки</Label>
        <Select
          value={data.venueType}
          onValueChange={(v) => setData({ ...data, venueType: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            {VENUE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Адрес</Label>
        <Input
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          placeholder="ул. Тверская, 15, Москва"
        />
      </div>
      <div className="space-y-2">
        <Label>Цена аренды (₽/час)</Label>
        <Input
          type="number"
          value={data.pricePerHour}
          onChange={(e) => setData({ ...data, pricePerHour: e.target.value })}
          placeholder="2500"
        />
      </div>
      <TagInput
        label="Оборудование"
        placeholder="Напр., Микрофон Shure SM58..."
        values={data.equipment}
        onChange={(v) => setData({ ...data, equipment: v })}
      />
      <div className="space-y-2">
        <Label>Описание площадки</Label>
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Расскажите о вашем заведении..."
          rows={3}
        />
      </div>
    </div>
  );
}

function ProducerDetails({
  data,
  setData,
}: {
  data: Partial<ProducerProfile>;
  setData: (d: Partial<ProducerProfile>) => void;
}) {
  const specs = [
    "Продюсирование",
    "Промоутинг",
    "Буккинг",
    "A&R",
    "Менеджмент",
    "Event-организация",
  ];
  const svcs = [
    "Продакшн",
    "Буккинг",
    "PR-поддержка",
    "Организация туров",
    "Студийное время",
    "Мерч",
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Специализация</Label>
        <div className="flex flex-wrap gap-2">
          {specs.map((s) => {
            const active = (data.specialization ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    specialization: active
                      ? (data.specialization ?? []).filter((x) => x !== s)
                      : [...(data.specialization ?? []), s],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <TagInput
        label="Жанры, с которыми работаете"
        placeholder="Добавить жанр"
        values={data.genresWorkedWith ?? []}
        onChange={(v) => setData({ ...data, genresWorkedWith: v })}
        suggestions={GENRES}
      />
      <div className="space-y-2">
        <Label>Предоставляемые услуги</Label>
        <div className="flex flex-wrap gap-2">
          {svcs.map((s) => {
            const active = (data.services ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    services: active
                      ? (data.services ?? []).filter((x) => x !== s)
                      : [...(data.services ?? []), s],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Артисты / проекты, с которыми работали</Label>
        <Textarea
          value={data.artistsWorkedWith ?? ""}
          onChange={(e) =>
            setData({ ...data, artistsWorkedWith: e.target.value })
          }
          placeholder="Расскажите о вашем опыте..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Ссылка на портфолио</Label>
        <Input
          value={data.portfolioUrl ?? ""}
          onChange={(e) => setData({ ...data, portfolioUrl: e.target.value })}
          placeholder="myportfolio.ru"
        />
      </div>
      <div className="space-y-2">
        <Label>Лейбл / агентство</Label>
        <Input
          value={data.labelAffiliation ?? ""}
          onChange={(e) =>
            setData({ ...data, labelAffiliation: e.target.value })
          }
          placeholder="Независимый / Название лейбла"
        />
      </div>
    </div>
  );
}

function SoundEngineerDetails({
  data,
  setData,
}: {
  data: Partial<SoundEngineerProfile>;
  setData: (d: Partial<SoundEngineerProfile>) => void;
}) {
  const specs = [
    "Запись",
    "Сведение",
    "Мастеринг",
    "Live-звук",
    "Саунд-дизайн",
    "Подкасты",
  ];
  const sw = [
    "Pro Tools",
    "Logic Pro",
    "Ableton Live",
    "Cubase",
    "FL Studio",
    "Reaper",
    "Waves",
    "iZotope",
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Специализация</Label>
        <div className="flex flex-wrap gap-2">
          {specs.map((s) => {
            const active = (data.specialization ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    specialization: active
                      ? (data.specialization ?? []).filter((x) => x !== s)
                      : [...(data.specialization ?? []), s],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Программное обеспечение</Label>
        <div className="flex flex-wrap gap-2">
          {sw.map((s) => {
            const active = (data.software ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    software: active
                      ? (data.software ?? []).filter((x) => x !== s)
                      : [...(data.software ?? []), s],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Оборудование</Label>
        <Textarea
          value={data.hardwareSummary ?? ""}
          onChange={(e) =>
            setData({ ...data, hardwareSummary: e.target.value })
          }
          placeholder="Консоль, мониторы, преампы..."
          rows={2}
        />
      </div>
      <TagInput
        label="Жанры"
        placeholder="Добавить жанр"
        values={data.genresWorkedWith ?? []}
        onChange={(v) => setData({ ...data, genresWorkedWith: v })}
        suggestions={GENRES}
      />
      <div className="space-y-2">
        <Label>Ссылка на портфолио</Label>
        <Input
          value={data.portfolioUrl ?? ""}
          onChange={(e) => setData({ ...data, portfolioUrl: e.target.value })}
          placeholder="soundcloud.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label>Студия / место работы</Label>
        <Input
          value={data.studioAffiliation ?? ""}
          onChange={(e) =>
            setData({ ...data, studioAffiliation: e.target.value })
          }
          placeholder="Студия «Звук», Москва"
        />
      </div>
    </div>
  );
}

function JournalistDetails({
  data,
  setData,
}: {
  data: Partial<JournalistProfile>;
  setData: (d: Partial<JournalistProfile>) => void;
}) {
  const specs = [
    "Рецензии",
    "Интервью",
    "Репортажи",
    "Live-фото",
    "Подкасты",
    "Редактура",
  ];

  return (
    <div className="space-y-5">
      <TagInput
        label="Издания / блоги"
        placeholder="Название издания или блога"
        values={data.mediaOutlets ?? []}
        onChange={(v) => setData({ ...data, mediaOutlets: v })}
      />
      <div className="space-y-2">
        <Label>Специализация</Label>
        <div className="flex flex-wrap gap-2">
          {specs.map((s) => {
            const active = (data.specialization ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    specialization: active
                      ? (data.specialization ?? []).filter((x) => x !== s)
                      : [...(data.specialization ?? []), s],
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <TagInput
        label="Жанровый фокус"
        placeholder="Добавить жанр"
        values={data.genresFocus ?? []}
        onChange={(v) => setData({ ...data, genresFocus: v })}
        suggestions={GENRES}
      />
      <div className="space-y-2">
        <Label>Ссылка на портфолио / блог</Label>
        <Input
          value={data.portfolioUrl ?? ""}
          onChange={(e) => setData({ ...data, portfolioUrl: e.target.value })}
          placeholder="myblog.ru"
        />
      </div>
      <div className="space-y-2">
        <Label>Социальные сети</Label>
        <Input
          value={data.socialMedia ?? ""}
          onChange={(e) => setData({ ...data, socialMedia: e.target.value })}
          placeholder="@username"
        />
      </div>
    </div>
  );
}

// --- Главный компонент ---

export default function LoginPage() {
  const router = useRouter();
  const { login, register, allUsers } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Base form
  const [base, setBase] = useState<BaseForm>(emptyBase);

  // Role-specific forms
  const [teacherData, setTeacherData] = useState<Partial<TeacherProfile>>({});
  const [venueData, setVenueData] = useState({
    venueName: "",
    venueType: "",
    address: "",
    pricePerHour: "",
    equipment: [] as string[],
    description: "",
  });
  const [producerData, setProducerData] = useState<Partial<ProducerProfile>>(
    {},
  );
  const [soundData, setSoundData] = useState<Partial<SoundEngineerProfile>>({});
  const [journalistData, setJournalistData] = useState<
    Partial<JournalistProfile>
  >({});

  const handleLogin = (userId: string) => {
    login(userId);
    router.push("/");
  };

  const handleRegisterSubmit = () => {
    if (!selectedRole) return;

    const userData: Omit<Musician, "id" | "aiTags" | "status" | "avatar"> = {
      name: base.name,
      email: base.email,
      phone: base.phone,
      role: selectedRole,
      instruments: base.instruments,
      genres: base.genres,
      skillLevel: base.skillLevel,
      location: base.location,
      bio: base.bio,
      ...(selectedRole === "teacher" && {
        teacherProfile: teacherData as TeacherProfile,
      }),
      ...(selectedRole === "producer" && {
        producerProfile: producerData as ProducerProfile,
      }),
      ...(selectedRole === "sound_engineer" && {
        soundEngineerProfile: soundData as SoundEngineerProfile,
      }),
      ...(selectedRole === "journalist" && {
        journalistProfile: journalistData as JournalistProfile,
      }),
    };

    register(userData);
    router.push("/profile");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleBadgeLabel = (role: UserRole) =>
    USER_ROLES.find((r) => r.id === role)?.label ?? role;

  const getRoleColor = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      musician: "bg-[#4361EE]/10 text-[#4361EE] border-[#4361EE]/30",
      teacher: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30",
      venue_admin: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
      producer: "bg-[#F72585]/10 text-[#F72585] border-[#F72585]/30",
      sound_engineer: "bg-[#7209B7]/10 text-[#7209B7] border-[#7209B7]/30",
      journalist: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]/30",
    };
    return map[role];
  };

  const canProceedBase =
    base.name.trim() !== "" &&
    base.email.trim() !== "" &&
    base.location.trim() !== "";

  // --- Шаги выбора роли ---
  const stepLabels: Record<Step, string> = {
    mode: "",
    role: "Выбор роли",
    base: "Основные данные",
    role_details: "Детали профиля",
    done: "Готово",
  };

  const progressSteps: Step[] = ["role", "base", "role_details"];

  // ===================== RENDER =====================

  // Экран входа
  if (mode === "login") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Вход в УМПСМ</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Социальная сеть для музыкантов
            </p>
          </div>

          {/* Email/password form */}
          <Card className="mb-4">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Пароль</Label>
                  <button className="text-xs text-primary hover:underline">
                    Забыли пароль?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button className="w-full mt-2" size="lg">
                Войти
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mb-8">
            Нет аккаунта?{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => {
                setMode("register");
                setStep("role");
                setSelectedRole(null);
                setBase(emptyBase);
              }}
            >
              Зарегистрироваться
            </button>
          </div>

          {/* Demo accounts */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">
                Тестовые аккаунты (MVP)
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid gap-2">
                {allUsers.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role] ?? Music;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleLogin(user.id)}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-muted hover:border-primary/50 transition-all text-left w-full"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                            user.status === "online"
                              ? "bg-[var(--status-online)]"
                              : user.status === "busy"
                                ? "bg-[var(--status-busy)]"
                                : user.status === "recording"
                                  ? "bg-[var(--status-recording)]"
                                  : "bg-[var(--status-offline)]",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {user.name}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border font-medium",
                            getRoleColor(user.role),
                          )}
                        >
                          <RoleIcon className="h-2.5 w-2.5" />
                          {getRoleBadgeLabel(user.role)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===================== РЕГИСТРАЦИЯ =====================

  const currentStepIndex = progressSteps.indexOf(step);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Music className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Регистрация в УМПСМ
          </h1>
        </div>

        {/* Progress */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-6 justify-center">
            {progressSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    currentStepIndex > i
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStepIndex === i
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-muted",
                  )}
                >
                  {currentStepIndex > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs hidden sm:block",
                    currentStepIndex === i
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {stepLabels[s]}
                </span>
                {i < progressSteps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5",
                      currentStepIndex > i ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ШАГ 1: Выбор роли */}
        {step === "role" && (
          <Card>
            <CardHeader>
              <CardTitle>Кто вы в мире музыки?</CardTitle>
              <CardDescription>
                Выберите вашу роль — от этого зависит профиль и возможности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {USER_ROLES.map((role) => {
                const Icon = ROLE_ICONS[role.id];
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {role.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
              <Separator className="my-2" />
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("login")}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Войти
                </Button>
                <Button
                  disabled={!selectedRole}
                  onClick={() => setStep("base")}
                >
                  Далее
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ШАГ 2: Базовые данные */}
        {step === "base" && (
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заполните базовые данные вашего профиля
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>
                      Имя и фамилия <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={base.name}
                      onChange={(e) =>
                        setBase({ ...base, name: e.target.value })
                      }
                      placeholder="Алексей Петров"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={base.email}
                      onChange={(e) =>
                        setBase({ ...base, email: e.target.value })
                      }
                      placeholder="alex@mail.ru"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input
                      value={base.phone}
                      onChange={(e) =>
                        setBase({ ...base, phone: e.target.value })
                      }
                      placeholder="+7 (916) 000-00-00"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>
                      Город <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={base.location}
                      onChange={(e) =>
                        setBase({ ...base, location: e.target.value })
                      }
                      placeholder="Москва"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>О себе</Label>
                    <Textarea
                      value={base.bio}
                      onChange={(e) =>
                        setBase({ ...base, bio: e.target.value })
                      }
                      placeholder="Расскажите немного о себе..."
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Музыкальные данные — для всех кроме venue_admin */}
                {selectedRole !== "venue_admin" && (
                  <MusicianDetails base={base} setBase={setBase} />
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("role")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>
                  <Button
                    disabled={!canProceedBase}
                    onClick={() => setStep("role_details")}
                  >
                    Далее
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ШАГ 3: Детали роли */}
        {step === "role_details" && selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle>
                {USER_ROLES.find((r) => r.id === selectedRole)?.label} — детали
                профиля
              </CardTitle>
              <CardDescription>
                Эта информация поможет найти вас нужным людям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedRole === "musician" && (
                  <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                    Вы уже заполнили музыкальные данные на предыдущем шаге.
                    Можно сразу завершить регистрацию.
                  </p>
                )}
                {selectedRole === "teacher" && (
                  <TeacherDetails data={teacherData} setData={setTeacherData} />
                )}
                {selectedRole === "venue_admin" && (
                  <VenueDetails data={venueData} setData={setVenueData} />
                )}
                {selectedRole === "producer" && (
                  <ProducerDetails
                    data={producerData}
                    setData={setProducerData}
                  />
                )}
                {selectedRole === "sound_engineer" && (
                  <SoundEngineerDetails
                    data={soundData}
                    setData={setSoundData}
                  />
                )}
                {selectedRole === "journalist" && (
                  <JournalistDetails
                    data={journalistData}
                    setData={setJournalistData}
                  />
                )}

                <Separator />

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("base")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>
                  <Button
                    onClick={handleRegisterSubmit}
                    disabled={!base.name || !base.email}
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Завершить регистрацию
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Подсказка под карточкой */}
        {step === "role" && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            <Users className="inline h-3.5 w-3.5 mr-1" />
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary hover:underline"
            >
              Войти
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// Инициализируем со step = 'role' при переходе на регистрацию
// (обёртка для сброса состояния)
