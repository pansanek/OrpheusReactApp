// components/moderation/ReportsFilters.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setFilters } from "@/store/slices/moderationSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectModerationState } from "@/store/slices/moderationSlice";

export const ReportsFilters = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(selectModerationState);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Поиск по ID, имени или описанию..."
          value={filters.searchQuery}
          onChange={(e) =>
            dispatch(setFilters({ searchQuery: e.target.value }))
          }
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status}
          onValueChange={(v) => dispatch(setFilters({ status: v as any }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="reviewed">Рассмотрено</SelectItem>
            <SelectItem value="resolved">Решено</SelectItem>
            <SelectItem value="dismissed">Отклонено</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.targetType}
          onValueChange={(v) => dispatch(setFilters({ targetType: v as any }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Тип контента" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="post">Посты</SelectItem>
            <SelectItem value="message">Сообщения</SelectItem>
            <SelectItem value="profile">Профили</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => dispatch(setFilters({ sortBy: v as any }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Сначала новые</SelectItem>
            <SelectItem value="oldest">Сначала старые</SelectItem>
            <SelectItem value="priority">По приоритету</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
