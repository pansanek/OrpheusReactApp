"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Musician,
  Group,
  Venue,
  Post,
  AITag,
  Comment,
  BookingStatus,
} from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { CreateGroupFormValues } from "../lib/validations/group";
import { store } from "@/store/store";
import {
  getMusicians,
  saveMusicians,
  getGroups,
  saveGroups,
  getVenues,
  saveVenues,
  getPosts,
  savePosts,
  getChats,
  saveChats,
  getMessages,
  saveMessages,
  getNotifications,
  saveNotifications,
  getJoinRequests,
  saveJoinRequests,
  getSentInvites,
  saveSentInvites,
  addSentInvite,
  getChatByGroupId,
  updateSentInviteStatus,
  updateJoinRequestStatus,
} from "@/lib/storage";
import { addMemberToGroupChat, initGroupChat } from "../lib/group-chat-utils";
import {
  AppNotification,
  BookingRequestNotification,
  GroupInviteNotification,
  GroupJoinRequestNotification,
} from "../lib/types/notification.types";
import { JoinRequest, SentInvite } from "../lib/types/request.types";
import { BookingRequest } from "@/lib/types";
import {
  getBookingRequests,
  hasTimeConflict,
  saveBookingRequests,
  updateBookingRequestStatus,
} from "@/lib/storage/booking.storage";

interface AuthContextType {
  currentUser: Musician | null;
  notifications: AppNotification[];
  unreadCount: number;
  groupsState: Group[];
  venuesState: Venue[];
  allUsers: Musician[];
  posts: Post[];
  joinRequests: Record<string, JoinRequest[]>;
  groupInvites: Record<string, SentInvite[]>;
  login: (userId: string) => void;
  logout: () => void;
  register: (
    data: Omit<Musician, "id" | "aiTags" | "status" | "avatar">,
  ) => void;
  updateProfile: (data: Partial<Musician>) => void;
  updateGroup: (groupId: string, data: Partial<Group>) => void;
  updateVenue: (venueId: string, data: Partial<Venue>) => void;
  addAITag: (tag: Omit<AITag, "id">) => void;
  removeAITag: (tagId: string) => void;
  sendGroupInvite: (params: {
    toUserId: string;
    fromUserId: string;
    groupId: string;
    newGroupData?: { name: string; genre: string; description: string };
    position: string;
    message: string;
  }) => void;
  acceptSendInvite: (groupId: string, userId: string) => void;
  declineSendInvite: (groupId: string, userId: string) => void;
  sendBookingRequest: (params: {
    venueId: string;
    venueName: string;
    venueAdminId: string;
    date: string;
    time: string;
    hours: number;
    totalPrice: number;
    message: string;
  }) => void;
  updateBookingStatus: (requestId: string, newStatus: BookingStatus) => boolean;
  markAllRead: () => void;
  markRead: (notificationId: string) => void;
  sendJoinRequest: (params: {
    toUserId: string;
    groupId: string;
    position: string;
    message: string;
  }) => void;
  acceptJoinRequest: (groupId: string, userId: string) => void;
  declineJoinRequest: (groupId: string, userId: string) => void;
  createGroup: (data: CreateGroupFormValues) => string;
  acceptGroupInvite: (notificationId: string) => void;
  declineGroupInvite: (notificationId: string) => void;
  createPost: (
    content: string,
    groupId: string | null,
    media?: { type: "image" | "video" | "audio"; url: string; name?: string }[],
  ) => void;
  addComment: (postId: string, text: string) => void;
  toggleLike: (postId: string) => void;
  addNotificationForUser: (
    userId: string,
    notification: AppNotification,
  ) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Musician | null>(null);
  const [allUsers, setAllUsers] = useState<Musician[]>(() => getMusicians());
  const [groupsState, setGroupsState] = useState<Group[]>(() => getGroups());
  const [venuesState, setVenuesState] = useState<Venue[]>(() => getVenues());
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [notificationsByUser, setNotificationsByUser] =
    useState(getNotifications);
  const [joinRequests, setJoinRequests] = useState<
    Record<string, JoinRequest[]>
  >(
    () => getJoinRequests(), // добавили () => для ленивой инициализации
  );
  const [groupInvites, setGroupInvites] = useState<
    Record<string, SentInvite[]>
  >(
    () => getSentInvites(), // добавили () => для ленивой инициализации
  );
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(
    () => getBookingRequests(), // добавили () => для ленивой инициализации
  );
  const notifications: AppNotification[] = currentUser
    ? (notificationsByUser[currentUser.id] ?? [])
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotificationForUser = useCallback(
    (userId: string, notification: AppNotification) => {
      setNotificationsByUser((prev) => {
        const updated = {
          ...prev,
          [userId]: [notification, ...(prev[userId] ?? [])],
        };
        saveNotifications(updated); // Сохраняем уведомления
        return updated;
      });
    },
    [],
  );

  const login = useCallback(
    (userId: string) => {
      const user = allUsers.find((m) => m.id === userId);
      if (user) setCurrentUser({ ...user });
    },
    [allUsers],
  );

  const register = useCallback(
    (data: Omit<Musician, "id" | "aiTags" | "status" | "avatar">) => {
      const newUser: Musician = {
        ...data,
        id: Date.now().toString(),
        avatar: null,
        status: "online",
        aiTags: [],
      };

      setAllUsers((prev) => {
        const updated = [...prev, newUser];
        saveMusicians(updated); // Централизованное сохранение
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
        //Используем централизованную функцию сохранения
        saveMusicians(updatedUsers);
        return updatedUsers;
      });

      return updated;
    });
  }, []);

  const saveUserNotifications = useCallback(
    (userId: string, updated: AppNotification[]) => {
      setNotificationsByUser((prev) => {
        const next = { ...prev, [userId]: updated };
        saveNotifications(next);
        return next;
      });
    },
    [],
  );
  const addAITag = useCallback((tag: Omit<AITag, "id">) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const newTag = { ...tag, id: Date.now().toString() };
      const updatedUser = { ...prev, aiTags: [...prev.aiTags, newTag] };

      // Синхронизируем с allUsers и сохраняем
      setAllUsers((users) => {
        const updatedUsers = users.map((u) =>
          u.id === prev.id ? updatedUser : u,
        );
        saveMusicians(updatedUsers);
        return updatedUsers;
      });

      return updatedUser;
    });
  }, []);
  const createGroup = useCallback(
    (data: CreateGroupFormValues) => {
      if (!currentUser) return "0";

      const openPositions = data.openPositions.map((instrument) => ({
        instrument,
      }));
      const invites = data.invites;
      // const inviteUserIds = invites.map(item => item.userId);
      const newGroup: Group = {
        id: Date.now().toString(),
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
      setGroupsState((prev) => {
        const updated = [...prev, newGroup];
        saveGroups(updated); //Сохраняем новую группу
        return updated;
      });

      if (invites.length > 0) {
        invites.forEach((invite) => {
          const notification: GroupInviteNotification = {
            id: Math.random().toString(),
            type: "group_invite",
            fromUserId: currentUser.id,
            fromUserName: currentUser.name,
            toUserId: invite.userId,
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

  const updateGroup = useCallback((groupId: string, data: Partial<Group>) => {
    setGroupsState((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId ? { ...g, ...data } : g,
      );
      saveGroups(updated);
      return updated;
    });
  }, []);

  const updateVenue = useCallback((venueId: string, data: Partial<Venue>) => {
    setVenuesState((prev) => {
      const updated = prev.map((v) =>
        v.id === venueId ? { ...v, ...data } : v,
      );
      saveVenues(updated); //Сохраняем в localStorage
      return updated;
    });
  }, []);

  const removeAITag = useCallback((tagId: string) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updatedUser = {
        ...prev,
        aiTags: prev.aiTags.filter((t) => t.id !== tagId),
      };

      setAllUsers((users) => {
        const updatedUsers = users.map((u) =>
          u.id === prev.id ? updatedUser : u,
        );
        saveMusicians(updatedUsers);
        return updatedUsers;
      });

      return updatedUser;
    });
  }, []);

  const sendGroupInvite = useCallback(
    (params: {
      toUserId: string;
      groupId: string;
      newGroupData?: { name: string; genre: string; description: string };
      position: string;
      message: string;
      fromUserId: string;
    }) => {
      if (!currentUser) return;

      let resolvedGroupId = params.groupId;
      let resolvedGroupName = "";

      if (params.groupId) {
        const g = groupsState.find((g) => g.id === params.groupId);
        resolvedGroupName = g?.name ?? "";
      } else if (params.newGroupData) {
        // ⚠️ Если создаём новую группу, сначала нужно её реально создать и получить ID
        // Для мока можно сгенерировать временный:
        resolvedGroupId = `temp-${Date.now()}`;
        resolvedGroupName = params.newGroupData.name;
      }

      setGroupInvites((prev) => {
        const updated = {
          ...prev,
          // 👇 Ключ — groupId, внутри массив инвайтов
          [resolvedGroupId]: [
            ...(prev[resolvedGroupId] ?? []),
            {
              fromUserId: params.fromUserId,
              toUserId: params.toUserId,
              groupId: resolvedGroupId,
              groupName: resolvedGroupName,
              position: params.position,
              message: params.message,
              createdAt: new Date().toISOString(),
              status: "sent" as const,
              id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        };
        saveSentInvites(updated);
        return updated;
      });

      const notification: GroupInviteNotification = {
        id: Date.now().toString(),
        type: "group_invite",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: params.toUserId,
        groupId: resolvedGroupId,
        groupName: resolvedGroupName,
        position: params.position,
        message: params.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      addNotificationForUser(params.toUserId, notification);
    },
    [currentUser, groupsState, addNotificationForUser],
  );

  const acceptSendInvite = useCallback(
    (groupId: string, userId: string) => {
      console.log("acceptSendInvite", groupId, userId);
      const user = allUsers.find((m) => m.id === userId);
      if (!user) return;
      setGroupsState((prev) => {
        const updated = prev.map((g) =>
          g.id === groupId && !g.members.includes(userId)
            ? { ...g, members: [...g.members, userId] }
            : g,
        );
        saveGroups(updated);
        return updated;
      });

      const chatId = getChatByGroupId(groupId);
      console.log("acceptSendInvite", chatId);
      if (!chatId) return;

      addMemberToGroupChat(
        groupId,
        userId,
        user.name,
        chatId.id,
        store.dispatch,
      );
      const sentInvites = getSentInvites(); // Получаем все отправленные инвайты
      console.log("acceptSendInvite", sentInvites);
      // Ищем инвайт: от кого (fromUserId) и какой ID, чтобы обновить статус
      let foundFromUserId: string | undefined;
      let foundInviteId: string | undefined;

      for (const [fromUserId, invites] of Object.entries(sentInvites)) {
        const invite = invites.find(
          (i) =>
            i.groupId === groupId &&
            i.toUserId === userId &&
            i.status === "sent",
        );
        if (invite) {
          foundFromUserId = fromUserId;
          foundInviteId = invite.id;
          break;
        }
      }
      console.log("acceptSendInvite", foundFromUserId, foundInviteId);
      // Если нашли — обновляем статус
      if (foundFromUserId && foundInviteId) {
        updateSentInviteStatus(foundFromUserId, foundInviteId, "accepted");
      }

      // Сохраняем обновлённые
      setGroupInvites((prev) => {
        const updated = {
          ...prev,
          [groupId]: (prev[groupId] ?? []).filter((r) => r.toUserId !== userId),
        };
        saveSentInvites(updated);
        return updated;
      });

      toast({ title: "Участник добавлен в группу" });
    },
    [allUsers],
  );

  const declineSendInvite = useCallback((groupId: string, userId: string) => {
    setGroupInvites((prev) => {
      const updated = {
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.toUserId !== userId),
      };
      saveSentInvites(updated);
      return updated;
    });
    const sentInvites = getSentInvites(); // Получаем все отправленные инвайты

    // Ищем инвайт: от кого (fromUserId) и какой ID, чтобы обновить статус
    let foundFromUserId: string | undefined;
    let foundInviteId: string | undefined;

    for (const [fromUserId, invites] of Object.entries(sentInvites)) {
      const invite = invites.find(
        (i) =>
          i.groupId === groupId && i.toUserId === userId && i.status === "sent",
      );
      if (invite) {
        foundFromUserId = fromUserId;
        foundInviteId = invite.id;
        break;
      }
    }

    // Если нашли — обновляем статус
    if (foundFromUserId && foundInviteId) {
      updateSentInviteStatus(foundFromUserId, foundInviteId, "declined");
    }
    toast({ title: "Запрос отклонён" });
  }, []);

  const sendJoinRequest = useCallback(
    (params: {
      toUserId: string;
      groupId: string;
      position: string;
      message: string;
    }) => {
      if (!currentUser) return;

      // 1. Сохраняем запрос в состояние группы
      setJoinRequests((prev) => {
        const updated = {
          ...prev,
          [params.groupId]: [
            ...(prev[params.groupId] ?? []),
            {
              id: Date.now().toString(),
              userId: currentUser!.id,
              position: params.position,
              message: params.message,
              groupId: params.groupId,
              status: "pending" as const,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        saveJoinRequests(updated); // Сохраняем запросы
        return updated;
      });

      // 2. Создаём уведомление для создателя группы
      const group = groupsState.find((g) => g.id === params.groupId);
      const notification: GroupJoinRequestNotification = {
        id: Date.now().toString(),
        type: "group_join_request",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar || undefined,
        groupId: params.groupId,
        toUserId: params.toUserId,
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
  const acceptJoinRequest = useCallback(
    (groupId: string, userId: string) => {
      const user = allUsers.find((m) => m.id === userId);
      if (!user) return;
      setGroupsState((prev) => {
        const updated = prev.map((g) =>
          g.id === groupId && !g.members.includes(userId)
            ? { ...g, members: [...g.members, userId] }
            : g,
        );
        saveGroups(updated);
        return updated;
      });
      const chatId = getChatByGroupId(groupId);
      if (!chatId) return;

      addMemberToGroupChat(
        groupId,
        userId,
        user.name,
        chatId.id,
        store.dispatch,
      );
      const joinRequests = getJoinRequests(); // Получаем все отправленные инвайты

      // Ищем инвайт: от кого (fromUserId) и какой ID, чтобы обновить статус
      let foundFromUserId: string | undefined;
      let foundRequestId: string | undefined;

      for (const [fromUserId, requests] of Object.entries(joinRequests)) {
        const request = requests.find(
          (i) =>
            i.groupId === groupId &&
            i.userId === userId &&
            i.status === "pending",
        );
        if (request) {
          foundFromUserId = fromUserId;
          foundRequestId = request.id;
          break;
        }
      }

      // Если нашли — обновляем статус
      if (foundFromUserId && foundRequestId) {
        updateJoinRequestStatus(groupId, userId, "approved");
      }
      // Сохраняем обновлённые joinRequests
      setJoinRequests((prev) => {
        const updated = {
          ...prev,
          [groupId]: (prev[groupId] ?? []).filter((r) => r.userId !== userId),
        };
        saveJoinRequests(updated);
        return updated;
      });

      toast({ title: "Участник добавлен в группу" });
    },
    [allUsers],
  );

  const declineJoinRequest = useCallback((groupId: string, userId: string) => {
    setJoinRequests((prev) => {
      const updated = {
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.userId !== userId),
      };
      saveJoinRequests(updated);
      return updated;
    });
    toast({ title: "Запрос отклонён" });
  }, []);

  const sendBookingRequest = useCallback(
    (
      data: Omit<BookingRequest, "id" | "status" | "createdAt" | "musicianId">,
    ) => {
      if (!currentUser) return;
      if (hasTimeConflict(data.venueId, data.date, data.time, data.hours)) {
        toast({
          title: "Время уже занято",
          description: "Выберите другое время или дату",
          variant: "destructive",
        });
        return null;
      }

      const newRequest: BookingRequest = {
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        musicianId: currentUser.id,
        ...data,
      };

      setBookingRequests((prev) => {
        const updated = [...prev, newRequest];
        saveBookingRequests(updated);
        return updated;
      });
      const notification: BookingRequestNotification = {
        id: Date.now().toString(),
        type: "booking_request",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        venueId: data.venueId,
        venueName: data.venueName,
        toUserId: data.venueAdminId,
        date: data.date,
        time: data.time,
        hours: data.hours,
        totalPrice: data.totalPrice,
        message: data.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      addNotificationForUser(data.venueAdminId, notification);
    },
    [currentUser, addNotificationForUser],
  );
  const updateBookingStatus = useCallback(
    (requestId: string, newStatus: BookingStatus) => {
      const updated = updateBookingRequestStatus(requestId, newStatus);

      if (updated) {
        setBookingRequests((prev) =>
          prev.map((r) => (r.id === requestId ? updated : r)),
        );

        const statusText = {
          approved: "Бронь подтверждена! Музыкант увидит её в календаре.",
          declined: "Заявка отклонена",
          pending: "Статус сброшен",
        }[newStatus];

        toast({ title: statusText });
        return true;
      }
      return false;
    },
    [],
  );
  const acceptGroupInvite = useCallback(
    (notificationId: string) => {
      console.log("acceptGroupInvite", notificationId);
      if (!currentUser) return;
      const userNotifications = notificationsByUser[currentUser.id] || [];
      const notif = userNotifications.find(
        (n) => n.id === notificationId && n.type === "group_invite",
      ) as GroupInviteNotification | undefined;

      if (!notif) return;

      setGroupsState((prev) => {
        const updated = prev.map((g) =>
          g.id === notif.groupId && !g.members.includes(currentUser.id)
            ? { ...g, members: [...g.members, currentUser.id] }
            : g,
        );
        saveGroups(updated);
        return updated;
      });
      setGroupInvites((prev) => {
        const updated = {
          ...prev,
          [notif.groupId]: (prev[notif.groupId] ?? []).filter(
            (invite) =>
              !(invite.toUserId === currentUser.id && invite.status === "sent"),
          ),
        };
        saveSentInvites(updated);
        return updated;
      });
      // Сохраняем обновлённые уведомления
      saveUserNotifications(
        currentUser.id,
        (notificationsByUser[currentUser.id] ?? []).filter(
          (n) => n.id !== notificationId,
        ),
      );

      toast({
        title: "Приглашение принято!",
        description: `Вы присоединились к группе "${notif.groupName}" на позицию "${notif.position}".`,
      });

      const chatId = getChatByGroupId(notif.groupId);
      if (!chatId) return;

      addMemberToGroupChat(
        notif.groupId,
        currentUser.id,
        currentUser.name,
        chatId.id,
        store.dispatch,
      );
    },
    [currentUser, notificationsByUser, saveUserNotifications],
  );

  const declineGroupInvite = useCallback(
    (notificationId: string) => {
      if (!currentUser) return;
      saveUserNotifications(
        currentUser.id,
        (notificationsByUser[currentUser.id] ?? []).filter(
          (n) => n.id !== notificationId,
        ),
      );
      toast({ title: "Приглашение отклонено", variant: "destructive" });
    },
    [currentUser, notificationsByUser, saveUserNotifications],
  );

  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    saveUserNotifications(
      currentUser.id,
      (notificationsByUser[currentUser.id] ?? []).map((n) => ({
        ...n,
        read: true,
      })),
    );
  }, [currentUser, notificationsByUser, saveUserNotifications]);

  const markRead = useCallback(
    (notificationId: string) => {
      if (!currentUser) return;
      saveUserNotifications(
        currentUser.id,
        (notificationsByUser[currentUser.id] ?? []).map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
    },
    [currentUser, notificationsByUser, saveUserNotifications],
  );

  const createPost = useCallback(
    (
      content: string,
      groupId: string | null,
      media?: {
        type: "image" | "video" | "audio";
        url: string;
        name?: string;
      }[],
    ) => {
      if (!currentUser) return;

      const newPost: Post = {
        id: Date.now().toString(),
        authorId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
        groupId,
        media,
      };
      console.warn(newPost);
      setPosts((prev) => {
        const updated = [newPost, ...prev];
        savePosts(updated);
        return updated;
      });

      toast({ title: "Пост опубликован!" });
    },
    [currentUser],
  );
  const addComment = useCallback(
    (postId: string, text: string) => {
      if (!currentUser) return;
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
      };
      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
        );
        savePosts(updated);
        return updated;
      });
    },
    [currentUser],
  );

  const toggleLike = useCallback(
    (postId: string) => {
      if (!currentUser) return;
      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === postId) {
            const hasLiked = p.likes.includes(currentUser.id);
            return {
              ...p,
              likes: hasLiked
                ? p.likes.filter((id) => id !== currentUser.id)
                : [...p.likes, currentUser.id],
            };
          }
          return p;
        });
        savePosts(updated);
        return updated;
      });
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        unreadCount,
        groupsState,
        venuesState,
        allUsers,
        joinRequests,
        groupInvites,
        notifications,
        posts,
        login,
        logout,
        register,
        updateProfile,
        updateGroup,
        updateVenue,
        addAITag,
        removeAITag,
        sendGroupInvite,
        acceptSendInvite,
        declineSendInvite,
        sendBookingRequest,
        updateBookingStatus,
        sendJoinRequest,
        markAllRead,
        markRead,
        acceptJoinRequest,
        declineJoinRequest,
        createGroup,
        acceptGroupInvite,
        declineGroupInvite,
        createPost,
        addComment,
        toggleLike,
        addNotificationForUser,
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
