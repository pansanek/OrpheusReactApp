"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Musician, Group, Venue, Post, AITag, Comment } from "@/lib/types";
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
} from "@/lib/storage";
import type { Chat, Message } from "@/store/types/chat.types";
import { addMemberToGroupChat, initGroupChat } from "../lib/group-chat-utils";
import {
  AppNotification,
  BookingRequestNotification,
  GroupInviteNotification,
  GroupJoinRequestNotification,
} from "../lib/types/notification.types";
import { JoinRequest } from "../lib/types/request.types";

interface AuthContextType {
  currentUser: Musician | null;
  notifications: AppNotification[];
  unreadCount: number;
  groupsState: Group[];
  venuesState: Venue[];
  allUsers: Musician[];
  posts: Post[];
  joinRequests: Record<number, JoinRequest[]>;

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
  createPost: (content: string, groupId: number | null, image?: string) => void;
  addComment: (postId: number, text: string) => void;
  toggleLike: (postId: number) => void;
  addNotificationForUser: (
    userId: number,
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
    Record<number, JoinRequest[]>
  >(
    () => getJoinRequests(), // 👈 добавили () => для ленивой инициализации
  );

  const notifications: AppNotification[] = currentUser
    ? (notificationsByUser[currentUser.id] ?? [])
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotificationForUser = useCallback(
    (userId: number, notification: AppNotification) => {
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
    (userId: number, updated: AppNotification[]) => {
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
      const newTag = { ...tag, id: Date.now() };
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
      setGroupsState((prev) => {
        const updated = [...prev, newGroup];
        saveGroups(updated); //Сохраняем новую группу
        return updated;
      });

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
    setGroupsState((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId ? { ...g, ...data } : g,
      );
      saveGroups(updated);
      return updated;
    });
  }, []);

  const updateVenue = useCallback((venueId: number, data: Partial<Venue>) => {
    setVenuesState((prev) => {
      const updated = prev.map((v) =>
        v.id === venueId ? { ...v, ...data } : v,
      );
      saveVenues(updated); //Сохраняем в localStorage
      return updated;
    });
  }, []);

  const removeAITag = useCallback((tagId: number) => {
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

  const sendJoinRequest = useCallback(
    (params: {
      toUserId: number;
      groupId: number;
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
  const acceptJoinRequest = useCallback(
    (groupId: number, userId: number) => {
      const user = allUsers.find((m) => m.id === userId);

      setGroupsState((prev) => {
        const updated = prev.map((g) =>
          g.id === groupId && !g.members.includes(userId)
            ? { ...g, members: [...g.members, userId] }
            : g,
        );
        saveGroups(updated);
        return updated;
      });

      if (user) {
        addMemberToGroupChat(groupId, user.id, user.name, store.dispatch);
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

  const declineJoinRequest = useCallback((groupId: number, userId: number) => {
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

      setGroupsState((prev) => {
        const updated = prev.map((g) =>
          g.id === notif.groupId && !g.members.includes(currentUser.id)
            ? { ...g, members: [...g.members, currentUser.id] }
            : g,
        );
        saveGroups(updated);
        return updated;
      });

      addMemberToGroupChat(
        notif.groupId,
        currentUser.id,
        currentUser.name,
        store.dispatch,
      );

      // 👇 Сохраняем обновлённые уведомления
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
    },
    [currentUser, notificationsByUser, saveUserNotifications],
  );

  const declineGroupInvite = useCallback(
    (notificationId: number) => {
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
    (notificationId: number) => {
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
    (content: string, groupId: number | null, image?: string) => {
      if (!currentUser) return;

      const newPost: Post = {
        id: Date.now(),
        authorId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
        groupId,
        image,
      };

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
    (postId: number, text: string) => {
      if (!currentUser) return;
      const newComment: Comment = {
        id: Date.now(),
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
    (postId: number) => {
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
        sendBookingRequest,
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
