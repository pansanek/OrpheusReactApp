'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { musicians as initialMusicians, groups, venues, type Musician, type AITag, type Group, type Venue } from './mock-data';

// --- Notification types ---

export type NotificationType = 'group_invite' | 'booking_request' | 'message';

export interface GroupInviteNotification {
  id: number;
  type: 'group_invite';
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
  type: 'booking_request';
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

export type AppNotification = GroupInviteNotification | BookingRequestNotification;

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
  register: (data: Omit<Musician, 'id' | 'aiTags' | 'status' | 'avatar'>) => void;
  updateProfile: (data: Partial<Musician>) => void;
  updateGroup: (groupId: number, data: Partial<Group>) => void;
  updateVenue: (venueId: number, data: Partial<Venue>) => void;
  addAITag: (tag: Omit<AITag, 'id'>) => void;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Musician | null>(null);
  const [allUsers, setAllUsers] = useState<Musician[]>([...initialMusicians]);
  const [groupsState, setGroupsState] = useState<Group[]>([...groups]);
  const [venuesState, setVenuesState] = useState<Venue[]>([...venues]);
  const [notificationsByUser, setNotificationsByUser] = useState<Record<number, AppNotification[]>>({});

  const notifications: AppNotification[] = currentUser
    ? (notificationsByUser[currentUser.id] ?? [])
    : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotificationForUser = useCallback((userId: number, notification: AppNotification) => {
    setNotificationsByUser(prev => ({
      ...prev,
      [userId]: [notification, ...(prev[userId] ?? [])],
    }));
  }, []);

  const login = useCallback((userId: number) => {
    const user = allUsers.find(m => m.id === userId);
    if (user) setCurrentUser({ ...user });
  }, [allUsers]);

  const register = useCallback((data: Omit<Musician, 'id' | 'aiTags' | 'status' | 'avatar'>) => {
    const newUser: Musician = {
      ...data,
      id: Date.now(),
      avatar: null,
      status: 'online',
      aiTags: [],
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Musician>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      setAllUsers(users => users.map(u => u.id === prev.id ? updated : u));
      return updated;
    });
  }, []);

  const updateGroup = useCallback((groupId: number, data: Partial<Group>) => {
    setGroupsState(prev => prev.map(g => g.id === groupId ? { ...g, ...data } : g));
  }, []);

  const updateVenue = useCallback((venueId: number, data: Partial<Venue>) => {
    setVenuesState(prev => prev.map(v => v.id === venueId ? { ...v, ...data } : v));
  }, []);

  const addAITag = useCallback((tag: Omit<AITag, 'id'>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newTag = { ...tag, id: Date.now() };
      return { ...prev, aiTags: [...prev.aiTags, newTag] };
    });
  }, []);

  const removeAITag = useCallback((tagId: number) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return { ...prev, aiTags: prev.aiTags.filter(t => t.id !== tagId) };
    });
  }, []);

  const sendGroupInvite = useCallback((params: {
    toUserId: number;
    groupId: number | null;
    newGroupData?: { name: string; genre: string; description: string };
    position: string;
    message: string;
  }) => {
    if (!currentUser) return;

    let resolvedGroupId = params.groupId;
    let resolvedGroupName = '';

    if (params.groupId) {
      const g = groupsState.find(g => g.id === params.groupId);
      resolvedGroupName = g?.name ?? '';
    } else if (params.newGroupData) {
      resolvedGroupId = Date.now();
      resolvedGroupName = params.newGroupData.name;
    }

    const notification: GroupInviteNotification = {
      id: Date.now(),
      type: 'group_invite',
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
  }, [currentUser, addNotificationForUser]);

  const sendBookingRequest = useCallback((params: {
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
      type: 'booking_request',
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
  }, [currentUser, addNotificationForUser]);

  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    setNotificationsByUser(prev => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] ?? []).map(n => ({ ...n, read: true })),
    }));
  }, [currentUser]);

  const markRead = useCallback((notificationId: number) => {
    if (!currentUser) return;
    setNotificationsByUser(prev => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] ?? []).map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      notifications,
      unreadCount,
      groupsState,
      venuesState,
      allUsers,
      notificationsByUser,
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
      markAllRead,
      markRead,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
