// tests/integration/context/auth-context.test.tsx
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import { useAuth } from "@/contexts/auth-context";
import type {
  Musician,
  Group,
  BookingStatus,
  Post,
  Venue,
  Comment,
  AITag,
} from "@/lib/types";
import type { CreateGroupFormValues } from "@/lib/validations/group";
import { toast } from "@/components/ui/use-toast";

// ============================================================================
// МОКИ (должны быть ДО импортов из мокаемых модулей!)
// ============================================================================

// Мокаем toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// 🔹 Мокаемые данные на уровне модуля (для доступа в тестах)
const mockStorage = {
  musicians: [] as Musician[],
  groups: [] as Group[],
  venues: [] as Venue[],
  posts: [] as Post[],
  notifications: {} as Record<string, any[]>,
  joinRequests: {} as Record<string, any[]>,
  sentInvites: {} as Record<string, any[]>,
  bookingRequests: [] as any[],
};

// 🔹 Мокаем storage
vi.mock("@/lib/storage", async () => {
  const actual = await vi.importActual("@/lib/storage");
  return {
    ...actual,
    getMusicians: vi.fn(() => [...mockStorage.musicians]),
    saveMusicians: vi.fn((data: Musician[]) => {
      mockStorage.musicians.length = 0;
      mockStorage.musicians.push(...data);
    }),
    getGroups: vi.fn(() => [...mockStorage.groups]),
    saveGroups: vi.fn((data: Group[]) => {
      mockStorage.groups.length = 0;
      mockStorage.groups.push(...data);
    }),
    getVenues: vi.fn(() => [...mockStorage.venues]),
    saveVenues: vi.fn((data: Venue[]) => {
      mockStorage.venues.length = 0;
      mockStorage.venues.push(...data);
    }),
    getPosts: vi.fn(() => [...mockStorage.posts]),
    savePosts: vi.fn((data: Post[]) => {
      mockStorage.posts.length = 0;
      mockStorage.posts.push(...data);
    }),
    getNotifications: vi.fn(() => ({ ...mockStorage.notifications })),
    saveNotifications: vi.fn((data) => {
      Object.assign(mockStorage.notifications, data);
    }),
    getJoinRequests: vi.fn(() => ({ ...mockStorage.joinRequests })),
    saveJoinRequests: vi.fn((data) => {
      Object.assign(mockStorage.joinRequests, data);
    }),
    getSentInvites: vi.fn(() => ({ ...mockStorage.sentInvites })),
    saveSentInvites: vi.fn((data) => {
      Object.assign(mockStorage.sentInvites, data);
    }),
    getChatByGroupId: vi.fn((groupId: string) => ({ id: `chat-${groupId}` })),
    updateSentInviteStatus: vi.fn(),
    updateJoinRequestStatus: vi.fn(),
    addSentInvite: vi.fn(),
  };
});

// 🔹 Мокаем group-chat-utils
vi.mock("@/lib/group-chat-utils", () => ({
  initGroupChat: vi.fn(),
  addMemberToGroupChat: vi.fn(),
}));

// 🔹 Мокаем booking.storage
vi.mock("@/lib/storage/booking.storage", () => ({
  getBookingRequests: vi.fn(() => []),
  hasTimeConflict: vi.fn(() => false),
  saveBookingRequests: vi.fn(),
  updateBookingRequestStatus: vi.fn((id: string, status: BookingStatus) => ({
    id,
    status,
    venueId: "venue-1",
    venueName: "Studio A",
    musicianId: "user-1",
    date: "2026-05-01",
    time: "18:00",
    hours: 2,
    totalPrice: 2000,
    message: "Test",
    createdAt: new Date().toISOString(),
  })),
}));

// 🔹 Мокаем Redux store
vi.mock("@/store/store", () => ({
  store: { dispatch: vi.fn(), getState: vi.fn(() => ({})), subscribe: vi.fn() },
}));

// ============================================================================
// 🔹 ИМПОРТЫ (после vi.mock!)
// ============================================================================
import {
  getMusicians,
  saveMusicians,
  getGroups,
  saveGroups,
  getVenues,
  saveVenues,
  getPosts,
  savePosts,
  getNotifications,
  saveNotifications,
  getJoinRequests,
  saveJoinRequests,
  getSentInvites,
  saveSentInvites,
  updateSentInviteStatus,
  updateJoinRequestStatus,
  getChatByGroupId,
} from "@/lib/storage";
import { initGroupChat, addMemberToGroupChat } from "@/lib/group-chat-utils";
import {
  hasTimeConflict,
  saveBookingRequests,
  updateBookingRequestStatus,
} from "@/lib/storage/booking.storage";
import { renderHook, act, waitFor } from "@/tests/__setup__/test-utils";

// ============================================================================
// ТЕСТЫ
// ============================================================================

describe("AuthContext — Полный набор тестов", () => {
  const mockUser: Musician = {
    id: "user-1",
    name: "Иван Тестов",
    email: "ivan@test.com",
    avatar: null,
    status: "online",
    aiTags: [],
    location: "Москва",
    instruments: ["guitar"],
    skillLevel: 5,
    genres: ["rock"],
    bio: "",
    socialLinks: {},
    role: "musician",
  };

  const mockGroup: Group = {
    id: "group-1",
    name: "Test Band",
    description: "Test",
    genre: "rock",
    members: ["user-1"],
    creatorId: "user-1",
    avatar: null,
    createdAt: new Date().toISOString(),
    city: "Москва",
  };

  beforeEach(() => {
    // 🔹 Очищаем мок-данные
    mockStorage.musicians = [mockUser];
    mockStorage.groups = [mockGroup];
    mockStorage.venues = [];
    mockStorage.posts = [];
    mockStorage.notifications = {};
    mockStorage.joinRequests = {};
    mockStorage.sentInvites = {};
    mockStorage.bookingRequests = [];

    // 🔹 Сбрасываем моки
    vi.clearAllMocks();

    // 🔹 Настраиваем возвращаемые значения
    vi.mocked(getMusicians).mockReturnValue([mockUser]);
    vi.mocked(getGroups).mockReturnValue([mockGroup]);
    vi.mocked(getVenues).mockReturnValue([]);
    vi.mocked(getPosts).mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // 🔹 Базовая аутентификация
  // --------------------------------------------------------------------------
  it("initial state: пользователь не авторизован", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toBeNull();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("login: устанавливает currentUser при нахождении пользователя", () => {
    const { result, rerender } = renderHook(() => useAuth());
    act(() => {
      result.current.login("user-1");
    });
    rerender();
    expect(result.current.currentUser?.id).toBe("user-1");
    expect(result.current.currentUser?.name).toBe("Иван Тестов");
  });

  it("login: не меняет состояние если пользователь не найден", () => {
    const { result, rerender } = renderHook(() => useAuth());
    act(() => {
      result.current.login("non-existent");
    });
    rerender();
    expect(result.current.currentUser).toBeNull();
  });

  it("logout: очищает currentUser", () => {
    const { result, rerender } = renderHook(() => useAuth());
    act(() => {
      result.current.login("user-1");
    });
    rerender();
    expect(result.current.currentUser).toBeTruthy();
    act(() => {
      result.current.logout();
    });
    rerender();
    expect(result.current.currentUser).toBeNull();
  });

  // --------------------------------------------------------------------------
  // 🔹 Регистрация (исправленные типы!)
  // --------------------------------------------------------------------------
  it("register: создаёт нового пользователя с правильными типами", () => {
    const { result, rerender } = renderHook(() => useAuth());

    // ✅ Исправлено: используем правильные поля из Omit<Musician, "id" | "aiTags" | "status" | "avatar">
    const registrationData = {
      name: "Новый Пользователь",
      email: "new@test.com",
      location: "СПб", // ✅ было: city
      instruments: ["bass"],
      genres: ["jazz"],
      skillLevel: 3, // ✅ добавлено (1-5)
      role: "musician" as const, // ✅ добавлено (UserRole)
      bio: "",
      socialLinks: {},
      // phone?, teacherProfile? — опциональны
    };

    act(() => {
      result.current.register(registrationData);
    });
    rerender();

    const user = result.current.currentUser;
    expect(user).toBeTruthy();
    expect(user?.name).toBe("Новый Пользователь");
    expect(user?.email).toBe("new@test.com");
    expect(user?.id).toBeDefined();
    expect(user?.aiTags).toEqual([]);
    expect(user?.status).toBe("online");
    expect(user?.role).toBe("musician");
    expect(user?.skillLevel).toBe(3);
    expect(user?.location).toBe("СПб");

    expect(saveMusicians).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ email: "new@test.com" }),
      ]),
    );
  });

  // --------------------------------------------------------------------------
  // Профиль
  // --------------------------------------------------------------------------
  describe("updateProfile", () => {
    it("обновляет данные текущего пользователя", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.updateProfile({ bio: "Новое био", skillLevel: 10 });
      });
      rerender();

      expect(result.current.currentUser?.bio).toBe("Новое био");
      expect(result.current.currentUser?.skillLevel).toBe(10);
      expect(saveMusicians).toHaveBeenCalled();
    });

    it("не обновляет, если currentUser === null", () => {
      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.updateProfile({ bio: "Test" });
      });
      expect(result.current.currentUser).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // AI Теги (исправленные типы!)
  // --------------------------------------------------------------------------
  describe(" AI Tags", () => {
    it("addAITag: добавляет тег к профилю", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addAITag({
          text: "Blues Expert",
          category: "genre",
        });
      });
      rerender();

      expect(result.current.currentUser?.aiTags).toHaveLength(1);
      expect(result.current.currentUser?.aiTags[0].text).toBe("Blues Expert");
      expect(result.current.currentUser?.aiTags[0].category).toBe("genre");
      expect(saveMusicians).toHaveBeenCalled();
    });

    it("removeAITag: удаляет тег по ID", () => {
      const userWithTags: Musician = {
        ...mockUser,
        aiTags: [{ id: "tag-1", text: "Rock", category: "genre" }],
      };
      mockStorage.musicians = [userWithTags];
      vi.mocked(getMusicians).mockReturnValue([userWithTags]);

      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.removeAITag("tag-1");
      });
      rerender();

      expect(result.current.currentUser?.aiTags).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Группы (исправлено: проверка через state, не через return value)
  // --------------------------------------------------------------------------
  describe("Groups", () => {
    it("createGroup: создаёт группу и инициирует чат", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      const groupData: CreateGroupFormValues = {
        name: "New Band",
        genre: "jazz",
        description: "Test",
        city: "Москва",
        openPositions: [],
        invites: [],
        socialLinks: {},
      };

      // Исправлено: проверяем через state, а не через возвращаемое значение
      act(() => {
        result.current.createGroup(groupData);
      });
      rerender();

      expect(result.current.groupsState).toHaveLength(2);
      const newGroup = result.current.groupsState.find(
        (g: { name: string }) => g.name === "New Band",
      );
      expect(newGroup).toBeDefined();
      expect(newGroup?.id).toBeTruthy();
      expect(newGroup?.id).not.toBe("0");

      expect(saveGroups).toHaveBeenCalled();
      expect(initGroupChat).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Группа создана!" }),
      );
    });

    it("updateGroup: обновляет данные группы", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.updateGroup("group-1", { description: "Updated" });
      });
      rerender();

      const updated = result.current.groupsState.find(
        (g: { id: string }) => g.id === "group-1",
      );
      expect(updated?.description).toBe("Updated");
      expect(saveGroups).toHaveBeenCalled();
    });

    it("updateVenue: обновляет данные площадки", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.updateVenue("venue-1", { city: "СПб" });
      });
      rerender();

      expect(saveVenues).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // 🔹 Приглашения и запросы
  // --------------------------------------------------------------------------
  describe("Invites & Join Requests", () => {
    it("sendGroupInvite: отправляет приглашение и создаёт уведомление", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.sendGroupInvite({
          toUserId: "user-2",
          fromUserId: "user-1",
          groupId: "group-1",
          position: "drummer",
          message: "Join us!",
        });
      });
      rerender();

      expect(saveSentInvites).toHaveBeenCalled();
      expect(saveNotifications).toHaveBeenCalled();
    });

    it("declineSendInvite: отклоняет приглашение", () => {
      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      act(() => {
        result.current.declineSendInvite("group-1", "user-2");
      });
      expect(saveSentInvites).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Запрос отклонён" }),
      );
    });

    it("sendJoinRequest: отправляет запрос на вступление", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.sendJoinRequest({
          toUserId: "admin-1",
          groupId: "group-1",
          position: "bassist",
          message: "Хочу в группу!",
        });
      });
      rerender();

      expect(saveJoinRequests).toHaveBeenCalled();
      expect(saveNotifications).toHaveBeenCalled();
    });

    it("declineJoinRequest: отклоняет запрос", () => {
      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      act(() => {
        result.current.declineJoinRequest("group-1", "user-2");
      });
      expect(saveJoinRequests).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Запрос отклонён" }),
      );
    });
  });

  // --------------------------------------------------------------------------
  // 🔹 Бронирование
  // --------------------------------------------------------------------------
  describe("Booking", () => {
    it("sendBookingRequest: создаёт заявку на бронь", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.sendBookingRequest({
          venueId: "venue-1",
          venueName: "Studio A",
          venueAdminId: "admin-1",
          date: "2026-05-01",
          time: "18:00",
          hours: 2,
          totalPrice: 2000,
          message: "Need studio",
        });
      });
      rerender();

      expect(saveBookingRequests).toHaveBeenCalled();
      expect(saveNotifications).toHaveBeenCalled();
    });

    it("sendBookingRequest: показывает ошибку при конфликте времени", () => {
      vi.mocked(hasTimeConflict).mockReturnValue(true);

      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });

      act(() => {
        result.current.sendBookingRequest({
          venueId: "venue-1",
          venueName: "Studio A",
          venueAdminId: "admin-1",
          date: "2026-05-01",
          time: "18:00",
          hours: 2,
          totalPrice: 2000,
          message: "Test",
        });
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Время уже занято",
          variant: "destructive",
        }),
      );
    });

    it("updateBookingStatus: обновляет статус брони", () => {
      vi.mocked(updateBookingRequestStatus).mockReturnValueOnce({
        id: "req-1",
        status: "approved",
        venueId: "venue-1",
        venueName: "Studio A",
        musicianId: "user-1",
        date: "2026-05-01",
        time: "18:00",
        hours: 2,
        totalPrice: 2000,
        message: "Test",
        venueAdminId: "1",
        createdAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });

      let success: boolean | undefined;
      act(() => {
        success = result.current.updateBookingStatus("req-1", "approved");
      });

      expect(success).toBe(true);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Бронь подтверждена! Музыкант увидит её в календаре.",
        }),
      );
    });
  });

  // --------------------------------------------------------------------------
  // Посты и взаимодействия
  // --------------------------------------------------------------------------
  describe("Posts & Interactions", () => {
    it("createPost: создаёт пост с контентом", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.createPost("Мой первый пост!", "group-1");
      });
      rerender();

      expect(result.current.posts).toHaveLength(1);
      expect(result.current.posts[0].content).toBe("Мой первый пост!");
      expect(savePosts).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Пост опубликован!" }),
      );
    });

    it("createPost: создаёт пост с медиа", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.createPost("Смотрите!", null, [
          { type: "image", url: "/img.jpg", name: "photo" },
        ]);
      });
      rerender();

      expect(result.current.posts[0].media).toHaveLength(1);
      expect(result.current.posts[0].media?.[0].url).toBe("/img.jpg");
    });

    it("addComment: добавляет комментарий к посту", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.createPost("Test post", null);
      });
      rerender();
      const postId = result.current.posts[0].id;

      act(() => {
        result.current.addComment(postId, "Great post!");
      });
      rerender();

      const post = result.current.posts.find(
        (p: { id: any }) => p.id === postId,
      );
      expect(post?.comments).toHaveLength(1);
      expect(post?.comments[0].text).toBe("Great post!");
      expect(savePosts).toHaveBeenCalled();
    });

    it("toggleLike: ставит и убирает лайк", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.createPost("Like test", null);
      });
      rerender();
      const postId = result.current.posts[0].id;

      act(() => {
        result.current.toggleLike(postId);
      });
      rerender();
      expect(result.current.posts[0].likes).toContain("user-1");

      act(() => {
        result.current.toggleLike(postId);
      });
      rerender();
      expect(result.current.posts[0].likes).not.toContain("user-1");
    });
  });

  // --------------------------------------------------------------------------
  // Уведомления
  // --------------------------------------------------------------------------
  describe("Notifications", () => {
    it("addNotificationForUser: добавляет уведомление пользователю", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addNotificationForUser("user-1", {
          id: "notif-1",
          type: "group_invite",
          fromUserId: "user-2",
          fromUserName: "Test",
          toUserId: "user-1",
          groupId: "group-1",
          groupName: "Band",
          position: "guitarist",
          message: "",
          createdAt: new Date().toISOString(),
          read: false,
        });
      });
      rerender();

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);
      expect(saveNotifications).toHaveBeenCalled();
    });

    it("markRead: помечает уведомление как прочитанное", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addNotificationForUser("user-1", {
          id: "notif-1",
          type: "group_invite",
          fromUserId: "user-2",
          fromUserName: "Test",
          toUserId: "user-1",
          groupId: "group-1",
          groupName: "Band",
          position: "",
          message: "",
          createdAt: new Date().toISOString(),
          read: false,
        });
      });
      rerender();

      act(() => {
        result.current.markRead("notif-1");
      });
      rerender();

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it("markAllRead: помечает все уведомления как прочитанные", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addNotificationForUser("user-1", {
          id: "n1",
          type: "group_invite",
          fromUserId: "u2",
          fromUserName: "T",
          toUserId: "user-1",
          groupId: "g1",
          groupName: "B",
          position: "",
          message: "",
          createdAt: new Date().toISOString(),
          read: false,
        });
        result.current.addNotificationForUser("user-1", {
          id: "n2",
          type: "group_invite",
          fromUserId: "u3",
          fromUserName: "T",
          toUserId: "user-1",
          groupId: "g2",
          groupName: "C",
          position: "",
          message: "",
          createdAt: new Date().toISOString(),
          read: false,
        });
      });
      rerender();

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAllRead();
      });
      rerender();

      expect(result.current.unreadCount).toBe(0);
      expect(
        result.current.notifications.every((n: { read: any }) => n.read),
      ).toBe(true);
    });

    it("acceptGroupInvite: принимает приглашение из уведомлений", () => {
      const notif: any = {
        id: "notif-1",
        type: "group_invite",
        fromUserId: "user-2",
        fromUserName: "Test",
        toUserId: "user-1",
        groupId: "group-1",
        groupName: "Test Band",
        position: "guitarist",
        message: "",
        createdAt: new Date().toISOString(),
        read: false,
      };

      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addNotificationForUser("user-1", notif);
      });
      rerender();

      act(() => {
        result.current.acceptGroupInvite("notif-1");
      });
      rerender();

      expect(result.current.notifications).toHaveLength(0);
      expect(saveGroups).toHaveBeenCalled();
      expect(addMemberToGroupChat).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Приглашение принято!" }),
      );
    });

    it("declineGroupInvite: отклоняет приглашение", () => {
      const notif: any = {
        id: "notif-1",
        type: "group_invite",
        fromUserId: "user-2",
        fromUserName: "Test",
        toUserId: "user-1",
        groupId: "group-1",
        groupName: "Test Band",
        position: "",
        message: "",
        createdAt: new Date().toISOString(),
        read: false,
      };

      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("user-1");
      });
      rerender();

      act(() => {
        result.current.addNotificationForUser("user-1", notif);
      });
      rerender();

      act(() => {
        result.current.declineGroupInvite("notif-1");
      });
      rerender();

      expect(result.current.notifications).toHaveLength(0);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Приглашение отклонено",
          variant: "destructive",
        }),
      );
    });
  });

  // --------------------------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------------------------
  describe("Edge Cases", () => {
    it("методы не падают при currentUser === null", () => {
      const { result } = renderHook(() => useAuth());

      expect(() =>
        act(() => result.current.updateProfile({ bio: "test" })),
      ).not.toThrow();
      expect(() =>
        act(() => result.current.addAITag({ text: "test", category: "genre" })),
      ).not.toThrow();
      expect(() =>
        act(() =>
          result.current.createGroup({
            name: "G",
            genre: "rock",
            description: "",
            city: "",
            openPositions: [],
            invites: [],
            socialLinks: {},
          }),
        ),
      ).not.toThrow();
      expect(() =>
        act(() =>
          result.current.sendGroupInvite({
            toUserId: "u2",
            fromUserId: "u1",
            groupId: "g1",
            position: "",
            message: "",
          }),
        ),
      ).not.toThrow();
      expect(() =>
        act(() =>
          result.current.sendBookingRequest({
            venueId: "v1",
            venueName: "V",
            venueAdminId: "a1",
            date: "2026-01-01",
            time: "12:00",
            hours: 1,
            totalPrice: 100,
            message: "",
          }),
        ),
      ).not.toThrow();
    });

    it("login с несуществующим userId не меняет состояние", () => {
      const { result, rerender } = renderHook(() => useAuth());
      act(() => {
        result.current.login("non-existent");
      });
      rerender();
      expect(result.current.currentUser).toBeNull();
    });
  });
});
