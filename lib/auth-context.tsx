"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  musicians as initialMusicians,
  groups,
  venues,
  type Musician,
  type AITag,
  type Group,
  type Venue,
  musicians,
} from "./mock-data";
import {
  getStoredMusicians,
  saveMusicians,
  getStoredGroups,
  saveGroups,
  getStoredVenues,
  saveVenues,
} from "@/lib/mock-storage";
import { toast } from "@/components/ui/use-toast";
import { CreateGroupFormValues } from "./validations/group";
import { store } from "@/store/store";

import type { Message } from "@/store/types/chat.types";
import { addMemberToGroupChat, initGroupChat } from "./group-chat-utils";
export type NotificationType = "group_invite" | "booking_request" | "message";

export interface GroupInviteNotification {
  id: number;
  type: "group_invite";
  fromUserId: number;
  fromUserName: string;
  groupId: number;
  groupName: string;
  position: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface BookingRequestNotification {
  id: number;
  type: "booking_request";
  fromUserId: number;
  fromUserName: string;
  venueName: string;
  venueId: number;
  date: string;
  time: string;
  hours: number;
  totalPrice: number;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface GroupJoinRequestNotification {
  id: number;
  type: "group_join_request";
  fromUserId: number;
  fromUserName: string;
  fromUserAvatar?: string;
  groupId: number;
  groupName: string;
  position: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type AppNotification =
  | GroupInviteNotification
  | BookingRequestNotification
  | GroupJoinRequestNotification;
// --- Auth context ---

interface AuthContextType {
  currentUser: Musician | null;
  notifications: AppNotification[];
  unreadCount: number;
  groupsState: Group[];
  venuesState: Venue[];
  allUsers: Musician[];
  login: (userId: number) => void;
  logout: () => void;
  register: (
    data: Omit<Musician, "id" | "aiTags" | "status" | "avatar">,
  ) => void;
  updateProfile: (data: Partial<Musician>) => void;
  updateGroup: (groupId: number, data: Partial<Group>) => void;
  updateVenue: (venueId: number, data: Partial<Venue>) => void;
  addAITag: (tag: Omit<AITag, "id">) => void;
  removeAITag: (tagId: number) => void;
  sendGroupInvite: (params: {
    toUserId: number;
    groupId: number | null;
    newGroupData?: { name: string; genre: string; description: string };
    position: string;
    message: string;
  }) => void;
  sendBookingRequest: (params: {
    venueId: number;
    venueName: string;
    venueAdminId: number;
    date: string;
    time: string;
    hours: number;
    totalPrice: number;
    message: string;
  }) => void;
  markAllRead: () => void;
  markRead: (notificationId: number) => void;
  notificationsByUser: Record<number, AppNotification[]>;
  joinRequests: Record<
    number,
    { userId: number; position: string; message: string; createdAt: string }[]
  >;
  sendJoinRequest: (params: {
    toUserId: number;
    groupId: number;
    position: string;
    message: string;
  }) => void;
  acceptJoinRequest: (groupId: number, userId: number) => void;
  declineJoinRequest: (groupId: number, userId: number) => void;
  createGroup: (data: CreateGroupFormValues) => number;
  acceptGroupInvite: (notificationId: number) => void;
  declineGroupInvite: (notificationId: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Musician | null>(null);
  const [allUsers, setAllUsers] = useState<Musician[]>(() =>
    getStoredMusicians(),
  );
  const [groupsState, setGroupsState] = useState<Group[]>(() =>
    getStoredGroups(),
  );
  const [venuesState, setVenuesState] = useState<Venue[]>(() =>
    getStoredVenues(),
  );

  const [notificationsByUser, setNotificationsByUser] = useState<
    Record<number, AppNotification[]>
  >({});

  const notifications: AppNotification[] = currentUser
    ? (notificationsByUser[currentUser.id] ?? [])
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotificationForUser = useCallback(
    (userId: number, notification: AppNotification) => {
      setNotificationsByUser((prev) => ({
        ...prev,
        [userId]: [notification, ...(prev[userId] ?? [])],
      }));
    },
    [],
  );

  const login = useCallback(
    (userId: number) => {
      const user = allUsers.find((m) => m.id === userId);
      if (user) setCurrentUser({ ...user });
    },
    [allUsers],
  );

  const register = useCallback(
    (data: Omit<Musician, "id" | "aiTags" | "status" | "avatar">) => {
      const newUser: Musician = {
        ...data,
        id: Date.now(),
        avatar: null,
        status: "online",
        aiTags: [],
      };

      setAllUsers((prev) => {
        const updated = [...prev, newUser];
        // 👇 Сохраняем нового пользователя
        try {
          localStorage.setItem("umpsm_users", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save to localStorage", e);
        }
        return updated;
      });

      setCurrentUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Musician>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };

      setAllUsers((users) => {
        const updatedUsers = users.map((u) => (u.id === prev.id ? updated : u));

        try {
          localStorage.setItem("umpsm_users", JSON.stringify(updatedUsers));
        } catch (e) {
          console.error("Failed to save to localStorage", e);
        }

        return updatedUsers;
      });

      return updated;
    });
  }, []);
  const createGroup = useCallback(
    (data: CreateGroupFormValues) => {
      if (!currentUser) return 0;

      //Адаптируйте эту маппинг-логику под вашу структуру OpenPosition, если она отличается
      const openPositions = data.openPositions.map((instrument) => ({
        instrument,
      }));
      const invites = data.invites;
      // const inviteUserIds = invites.map(item => item.userId);
      const newGroup: Group = {
        id: Date.now(),
        name: data.name,
        description: data.description || "",
        genre: data.genre,
        members: [currentUser.id],
        creatorId: currentUser.id,
        avatar: data.avatar || null,
        createdAt: new Date().toISOString(),
        city: data.city || undefined,
        rehearsalSchedule: data.rehearsalSchedule || undefined,
        socialLinks: {
          vk: data.socialLinks?.vk || undefined,
          youtube: data.socialLinks?.youtube || undefined,
          soundcloud: data.socialLinks?.soundcloud || undefined,
        },
        openPositions: openPositions.length > 0 ? openPositions : undefined,
      };

      initGroupChat(newGroup, store.dispatch, currentUser.id.toString());
      setGroupsState((prev) => [...prev, newGroup]);

      if (invites.length > 0) {
        invites.forEach((invite) => {
          const notification: GroupInviteNotification = {
            id: Date.now() + Math.random(),
            type: "group_invite",
            fromUserId: currentUser.id,
            fromUserName: currentUser.name,
            groupId: newGroup.id,
            groupName: newGroup.name,
            createdAt: new Date().toISOString(),
            read: false,
            position: invite.position,
            message: "",
          };
          addNotificationForUser(invite.userId, notification);
        });
      }

      toast({
        title: "Группа создана!",
        description: `"${newGroup.name}" добавлена в каталог.`,
      });

      return newGroup.id;
    },
    [currentUser, setGroupsState, addNotificationForUser],
  );

  const updateGroup = useCallback((groupId: number, data: Partial<Group>) => {
    setGroupsState((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...data } : g)),
    );
  }, []);

  const updateVenue = useCallback((venueId: number, data: Partial<Venue>) => {
    setVenuesState((prev) =>
      prev.map((v) => (v.id === venueId ? { ...v, ...data } : v)),
    );
  }, []);

  const addAITag = useCallback((tag: Omit<AITag, "id">) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const newTag = { ...tag, id: Date.now() };
      return { ...prev, aiTags: [...prev.aiTags, newTag] };
    });
  }, []);

  const removeAITag = useCallback((tagId: number) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      return { ...prev, aiTags: prev.aiTags.filter((t) => t.id !== tagId) };
    });
  }, []);

  const sendGroupInvite = useCallback(
    (params: {
      toUserId: number;
      groupId: number | null;
      newGroupData?: { name: string; genre: string; description: string };
      position: string;
      message: string;
    }) => {
      if (!currentUser) return;

      let resolvedGroupId = params.groupId;
      let resolvedGroupName = "";

      if (params.groupId) {
        const g = groupsState.find((g) => g.id === params.groupId);
        resolvedGroupName = g?.name ?? "";
      } else if (params.newGroupData) {
        resolvedGroupId = Date.now();
        resolvedGroupName = params.newGroupData.name;
      }

      const notification: GroupInviteNotification = {
        id: Date.now(),
        type: "group_invite",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        groupId: resolvedGroupId ?? 0,
        groupName: resolvedGroupName,
        position: params.position,
        message: params.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      addNotificationForUser(params.toUserId, notification);
    },
    [currentUser, addNotificationForUser],
  );
  const [joinRequests, setJoinRequests] = useState<
    Record<
      number,
      {
        userId: number;
        position: string;
        message: string;
        createdAt: string;
      }[]
    >
  >({});
  const sendJoinRequest = useCallback(
    (params: {
      toUserId: number;
      groupId: number;
      position: string;
      message: string;
    }) => {
      if (!currentUser) return;

      // 1. Сохраняем запрос в состояние группы
      setJoinRequests((prev) => ({
        ...prev,
        [params.groupId]: [
          ...(prev[params.groupId] ?? []),
          {
            userId: currentUser.id,
            position: params.position,
            message: params.message,
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      // 2. Создаём уведомление для создателя группы
      const group = groupsState.find((g) => g.id === params.groupId);
      const notification: GroupJoinRequestNotification = {
        id: Date.now(),
        type: "group_join_request",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar || undefined,
        groupId: params.groupId,
        groupName: group?.name ?? "",
        position: params.position,
        message: params.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      addNotificationForUser(params.toUserId, notification);
    },
    [currentUser, groupsState, addNotificationForUser],
  );
  const acceptJoinRequest = useCallback((groupId: number, userId: number) => {
    const user = musicians.find((m) => m.id === userId);
    // Добавляем пользователя в группу
    setGroupsState((prev) =>
      prev.map((g) =>
        g.id === groupId && !g.members.includes(userId)
          ? { ...g, members: [...g.members, userId] }
          : g,
      ),
    );
    if (user) {
      // Добавляем в чат группы
      addMemberToGroupChat(groupId, user.id, user.name, store.dispatch);
    }
    // Удаляем запрос
    setJoinRequests((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] ?? []).filter((r) => r.userId !== userId),
    }));
    toast({ title: "Участник добавлен в группу" });
  }, []);

  const declineJoinRequest = useCallback((groupId: number, userId: number) => {
    setJoinRequests((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] ?? []).filter((r) => r.userId !== userId),
    }));
    toast({ title: "Запрос отклонён" });
  }, []);

  const sendBookingRequest = useCallback(
    (params: {
      venueId: number;
      venueName: string;
      venueAdminId: number;
      date: string;
      time: string;
      hours: number;
      totalPrice: number;
      message: string;
    }) => {
      if (!currentUser) return;

      const notification: BookingRequestNotification = {
        id: Date.now(),
        type: "booking_request",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        venueId: params.venueId,
        venueName: params.venueName,
        date: params.date,
        time: params.time,
        hours: params.hours,
        totalPrice: params.totalPrice,
        message: params.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      addNotificationForUser(params.venueAdminId, notification);
    },
    [currentUser, addNotificationForUser],
  );
  const acceptGroupInvite = useCallback(
    (notificationId: number) => {
      if (!currentUser) return;
      const userNotifications = notificationsByUser[currentUser.id] || [];
      const notif = userNotifications.find(
        (n) => n.id === notificationId && n.type === "group_invite",
      ) as GroupInviteNotification | undefined;

      if (!notif) return;

      // 1. Добавляем пользователя в группу
      setGroupsState((prev) =>
        prev.map((g) =>
          g.id === notif.groupId && !g.members.includes(currentUser.id)
            ? { ...g, members: [...g.members, currentUser.id] }
            : g,
        ),
      );

      addMemberToGroupChat(
        notif.groupId,
        currentUser.id,
        currentUser.name,
        store.dispatch,
      );
      // 2. Удаляем уведомление
      setNotificationsByUser((prev) => ({
        ...prev,
        [currentUser.id]:
          prev[currentUser.id]?.filter((n) => n.id !== notificationId) || [],
      }));

      toast({
        title: "Приглашение принято!",
        description: `Вы присоединились к группе "${notif.groupName}" на позицию "${notif.position}".`,
      });
    },
    [currentUser, notifications, setGroupsState, setNotificationsByUser],
  );

  const declineGroupInvite = useCallback(
    (notificationId: number) => {
      if (!currentUser) return;

      setNotificationsByUser((prev) => ({
        ...prev,
        [currentUser.id]:
          prev[currentUser.id]?.filter((n) => n.id !== notificationId) || [],
      }));

      toast({ title: "Приглашение отклонено", variant: "destructive" });
    },
    [currentUser, setNotificationsByUser],
  );
  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    setNotificationsByUser((prev) => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] ?? []).map((n) => ({
        ...n,
        read: true,
      })),
    }));
  }, [currentUser]);

  const markRead = useCallback(
    (notificationId: number) => {
      if (!currentUser) return;
      setNotificationsByUser((prev) => ({
        ...prev,
        [currentUser.id]: (prev[currentUser.id] ?? []).map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      }));
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        notifications,
        unreadCount,
        groupsState,
        venuesState,
        allUsers,
        notificationsByUser,
        joinRequests,
        login,
        logout,
        register,
        updateProfile,
        updateGroup,
        updateVenue,
        addAITag,
        removeAITag,
        sendGroupInvite,
        sendBookingRequest,
        sendJoinRequest,
        markAllRead,
        markRead,
        acceptJoinRequest,
        declineJoinRequest,
        createGroup,
        acceptGroupInvite,
        declineGroupInvite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
