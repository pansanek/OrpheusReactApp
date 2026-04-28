// store/slices/moderationSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ModerationReport,
  ReportStatus,
  ModerationStatus,
  ModerationQueueItem,
  ReportTargetType,
  ReportReason,
} from "@/lib/types/moderation.types";
import { MOCK_REPORTS } from "@/lib/mock-data/moderation.mock";
import { RootState } from "../store";
import {
  getModerationReports,
  addModerationReport,
  updateModerationReport,
  saveModerationReports,
} from "@/lib/storage/moderation.storage";

// ============================================================================
// MOCK API (заглушка вместо реального бэкенда)
// ============================================================================

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface ModerationState {
  reports: ModerationReport[]; // Все репорты
  queue: ModerationQueueItem[]; // Отфильтрованная очередь (pending)
  selectedReportId: string | null; // ID выбранного для просмотра репорта
  loading: boolean; // Загрузка списка
  submitting: boolean; // Отправка нового репорта
  actionLoading: Record<string, boolean>; // Загрузка действий по конкретным ID
  filters: {
    status: ReportStatus | "all";
    targetType: ReportTargetType | "all";
    reason: string | "all";
    searchQuery: string;
    sortBy: "newest" | "oldest" | "priority";
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  error: string | null;
}

// ============================================================================
//  ASYNC THUNKS (Mock API calls)
// ============================================================================

// Загрузка репортов
export const fetchModerationReports = createAsyncThunk(
  "moderation/fetchReports",
  async () => {
    return getModerationReports();
  },
);

// Создание нового репорта (вызывается когда пользователь жмёт "Пожаловаться")
export const submitModerationReport = createAsyncThunk(
  "moderation/submitReport",
  async (reportData: {
    reporterId: string;
    reporterName?: string;
    targetId: string;
    targetType: ReportTargetType;
    reason: ReportReason;
    customReason?: string;
    description?: string;
  }) => {
    addModerationReport(reportData);
    return getModerationReports()[0]; // Возвращаем свежедобавленный (он в начале массива)
  },
);

// Обновление статуса репорта + контент
export const updateModerationReportAction = createAsyncThunk(
  "moderation/updateReportStatus",
  async (payload: {
    reportId: string;
    status: ReportStatus;
    reviewedBy: string;
    resolution?: string;
    contentUpdates?: {
      targetId: string;
      targetType: ReportTargetType;
      updates: Partial<{
        moderationStatus: ModerationStatus;
        isBanned: boolean;
        hiddenFromFeed: boolean;
        hidden: boolean;
      }>;
    };
  }) => {
    updateModerationReport(payload.reportId, {
      status: payload.status,
      reviewedBy: payload.reviewedBy,
      resolution: payload.resolution,
    });

    // Логика применения к контенту (пока только лог/заглушка)
    if (payload.contentUpdates) {
      console.log(
        `[STORAGE] Content updated for ${payload.contentUpdates.targetType} ${payload.contentUpdates.targetId}:`,
        payload.contentUpdates.updates,
      );
      // Здесь в будущем будет вызов updatePost/updateMessage/updateUser из других хранилищ
    }

    return getModerationReports().find((r) => r.id === payload.reportId)!;
  },
);

// Бан/разбан пользователя (расширенное действие)
export const toggleUserBan = createAsyncThunk(
  "moderation/toggleBan",
  (payload: {
    userId: string;
    ban: boolean;
    reason: string;
    moderatedBy: string;
  }) => {
    // 1. Обновляем все репорты, связанные с этим профилем
    const reports = getModerationReports();
    const updatedReports = reports.map((report) =>
      report.targetId === payload.userId && report.targetType === "profile"
        ? {
            ...report,
            status: "resolved" as ReportStatus,
            reviewedBy: payload.moderatedBy,
            reviewedAt: Date.now(),
            resolution: payload.ban
              ? `Пользователь заблокирован: ${payload.reason}`
              : "Бан снят",
          }
        : report,
    );
    saveModerationReports(updatedReports);

    // 2. Обновляем сам профиль (через users.storage — заглушка, пока нет реального метода)
    // В будущем: import { updateUserProfile } from '@/lib/storage/users.storage';
    // updateUserProfile(payload.userId, {
    //   isBanned: payload.ban,
    //   banReason: payload.ban ? payload.reason : undefined,
    //   bannedAt: payload.ban ? Date.now() : undefined,
    //   bannedBy: payload.ban ? payload.moderatedBy : undefined,
    //   profileStatus: payload.ban ? 'suspended' : 'active',
    // });

    console.log(
      `[STORAGE] User ${payload.userId} ${payload.ban ? "banned" : "unbanned"} by ${payload.moderatedBy}`,
    );

    // 3. Возвращаем результат для extraReducers
    return {
      userId: payload.userId,
      isBanned: payload.ban,
      banReason: payload.ban ? payload.reason : undefined,
      bannedAt: payload.ban ? Date.now() : undefined,
      bannedBy: payload.ban ? payload.moderatedBy : undefined,
    };
  },
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: ModerationState = {
  reports: [],
  queue: [],
  selectedReportId: null,
  loading: false,
  submitting: false,
  actionLoading: {},
  filters: {
    status: "pending", // по умолчанию показываем только ожидающие
    targetType: "all",
    reason: "all",
    searchQuery: "",
    sortBy: "newest",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  error: null,
};

const moderationSlice = createSlice({
  name: "moderation",
  initialState,
  reducers: {
    setSelectedReport: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },

    setFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // сброс страницы при изменении фильтров
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // Оптимистичное добавление репорта в список (пока ждём ответ сервера)
    addReportOptimistic: (state, action: PayloadAction<ModerationReport>) => {
      state.reports.unshift(action.payload);
      if (action.payload.status === "pending") {
        state.queue.unshift({ report: action.payload });
      }
    },

    // Локальное обновление репорта (для мгновенного отклика UI)
    updateReportLocally: (
      state,
      action: PayloadAction<{
        reportId: string;
        updates: Partial<ModerationReport>;
      }>,
    ) => {
      const { reportId, updates } = action.payload;
      const report = state.reports.find((r) => r.id === reportId);
      if (report) {
        Object.assign(report, updates);

        // Обновляем очередь если нужно
        if (updates.status && updates.status !== "pending") {
          state.queue = state.queue.filter(
            (item) => item.report.id !== reportId,
          );
        }
      }
    },

    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },

    // Моковое добавление тестовых данных (для разработки)
    __addMockReports: (state, action: PayloadAction<ModerationReport[]>) => {
      state.reports = [...action.payload, ...state.reports];
      state.queue = action.payload
        .filter((r) => r.status === "pending")
        .map((r) => ({ report: r }))
        .concat(state.queue);
    },
  },

  extraReducers: (builder) => {
    // === fetchModerationReports ===
    builder
      .addCase(fetchModerationReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModerationReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
        state.queue = action.payload
          .filter((r) => r.status === "pending")
          .map((r) => ({ report: r }));
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchModerationReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // === submitModerationReport ===
    builder
      .addCase(submitModerationReport.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitModerationReport.fulfilled, (state, action) => {
        state.submitting = false;
        // Репорт уже добавлен через mockApi в массив,
        // но для надёжности обновим локально:
        if (!state.reports.find((r) => r.id === action.payload.id)) {
          state.reports.unshift(action.payload);
        }
        if (action.payload.status === "pending") {
          if (
            !state.queue.find((item) => item.report.id === action.payload.id)
          ) {
            state.queue.unshift({ report: action.payload });
          }
        }
      })
      .addCase(submitModerationReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // === updateModerationReport ===
    builder
      .addCase(updateModerationReportAction.pending, (state, action) => {
        state.actionLoading[action.meta.arg.reportId] = true;
      })
      .addCase(updateModerationReportAction.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.reports.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.reports[index] = updated;
        }
        // Удаляем из очереди если статус больше не pending
        if (updated.status !== "pending") {
          state.queue = state.queue.filter(
            (item) => item.report.id !== updated.id,
          );
        }
        delete state.actionLoading[action.meta.arg.reportId];
      })
      .addCase(updateModerationReportAction.rejected, (state, action) => {
        state.error = action.payload as string;
        delete state.actionLoading[action.meta.arg.reportId];
      });

    // === toggleUserBan ===
    builder
      .addCase(toggleUserBan.pending, (state, action) => {
        state.actionLoading[`ban_${action.meta.arg.userId}`] = true;
      })
      .addCase(toggleUserBan.fulfilled, (state, action) => {
        // Обновляем все репорты связанные с этим пользователем
        state.reports = state.reports.map((report) =>
          report.targetId === action.payload.userId &&
          report.targetType === "profile"
            ? {
                ...report,
                resolution: action.payload.isBanned
                  ? `Пользователь заблокирован: ${action.payload.banReason}`
                  : report.resolution,
              }
            : report,
        );
        delete state.actionLoading[`ban_${action.payload.userId}`];
      })
      .addCase(toggleUserBan.rejected, (state, action) => {
        state.error = action.payload as string;
        delete state.actionLoading[`ban_${action.meta.arg.userId}`];
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  setSelectedReport,
  setFilters,
  resetFilters,
  setPage,
  addReportOptimistic,
  updateReportLocally,
  clearError,
  __addMockReports, // только для dev
} = moderationSlice.actions;

export default moderationSlice.reducer;

// ============================================================================
// SELECTORS (типизированные)
// ============================================================================

export const selectModerationState = (state: RootState) => state.moderation;

export const selectAllReports = (state: RootState) => state.moderation.reports;

export const selectModerationQueue = (state: RootState) => {
  const { reports, filters, pagination } = state.moderation;

  let filtered = [...reports];

  // Фильтр по статусу
  if (filters.status !== "all") {
    filtered = filtered.filter((r) => r.status === filters.status);
  }

  // Фильтр по типу контента
  if (filters.targetType !== "all") {
    filtered = filtered.filter((r) => r.targetType === filters.targetType);
  }

  // Фильтр по причине
  if (filters.reason !== "all") {
    filtered = filtered.filter((r) => r.reason === filters.reason);
  }

  // Поиск по тексту
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.reporterName?.toLowerCase().includes(query) ||
        r.customReason?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.targetId.toLowerCase().includes(query),
    );
  }

  // Сортировка
  switch (filters.sortBy) {
    case "oldest":
      filtered.sort((a, b) => a.timestamp - b.timestamp);
      break;
    case "priority":
      // Приоритет: харассмент > спам > остальное
      const priority: Record<ReportReason, number> = {
        harassment: 3,
        spam: 2,
        inappropriate_content: 1,
        fake_profile: 1,
        copyright_violation: 1,
        off_topic: 0,
        other: 0,
      };
      filtered.sort(
        (a, b) =>
          (priority[b.reason] || 0) - (priority[a.reason] || 0) ||
          b.timestamp - a.timestamp,
      );
      break;
    case "newest":
    default:
      filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Пагинация
  const start = (pagination.page - 1) * pagination.limit;
  const end = start + pagination.limit;

  return {
    items: filtered
      .slice(start, end)
      .map((report) => ({ report })) as ModerationQueueItem[],
    total: filtered.length,
    page: pagination.page,
    limit: pagination.limit,
  };
};

export const selectReportById = (state: RootState, reportId: string) =>
  state.moderation.reports.find((r: { id: string }) => r.id === reportId);

export const selectIsReportLoading = (state: RootState, reportId: string) =>
  state.moderation.actionLoading[reportId] || false;

export const selectUserBanLoading = (state: RootState, userId: string) =>
  state.moderation.actionLoading[`ban_${userId}`] || false;

// Селектор для проверки прав (упрощённый)
export const selectCanModerate = (state: RootState, userRole?: string) => {
  if (!userRole) return false;
  return ["moderator", "admin"].includes(userRole);
};
