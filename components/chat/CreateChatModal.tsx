"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { musicians, venues } from "@/lib/mock-data";
import {
  createDirectChat,
  createGroupChat,
  createVenueChat,
} from "@/store/slices/chatSlice";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
type TabType = "direct" | "group" | "Venue";

export const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<TabType>("direct");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const handleCreateDirectChat = () => {
    if (!selectedUser) return;

    const user = musicians.find((u) => u.id.toString() === selectedUser);
    if (user) {
      dispatch(
        createDirectChat({
          participantId: user.id.toString(),
          participantName: user.name,
          participantAvatar: user.avatar || getInitials(user.name),
        }),
      );
      handleClose();
    }
  };

  const handleCreateGroupChat = () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    dispatch(
      createGroupChat({
        name: groupName,
        participantIds: selectedUsers,
      }),
    );
    handleClose();
  };

  const handleCreateVenueChat = () => {
    if (!selectedVenue) return;

    const venue = venues.find((i) => i.id.toString() === selectedVenue);
    if (venue) {
      dispatch(
        createVenueChat({
          venueId: venue.id.toString(),
          venueName: venue.name,
          type: venue.type,
        }),
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setTab("direct");
    setSelectedUser(null);
    setSelectedUsers([]);
    setGroupName("");
    setSelectedVenue(null);
    onClose();
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Новый чат</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("direct")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "direct"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Диалог
          </button>
          <button
            onClick={() => setTab("group")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "group"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Группа
          </button>
          <button
            onClick={() => setTab("Venue")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "Venue"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Учреждение
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "direct" && (
            <div className="space-y-2">
              {musicians.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id.toString())}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedUser === user.id.toString()
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-sm text-gray-900">{user.name}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "group" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Название группы"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Участники ({selectedUsers.length})
                </p>
                {musicians.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id.toString())}
                      onChange={() => toggleUserSelection(user.id.toString())}
                      className="w-4 h-4"
                    />
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-900">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === "Venue" && (
            <div className="space-y-2">
              {venues.map((Venue) => (
                <button
                  key={Venue.id}
                  onClick={() => setSelectedVenue(Venue.id.toString())}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedVenue === Venue.id.toString()
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <p className="font-medium text-gray-900">{Venue.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{Venue.type}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Отмена
          </button>
          <button
            onClick={
              tab === "direct"
                ? handleCreateDirectChat
                : tab === "group"
                  ? handleCreateGroupChat
                  : handleCreateVenueChat
            }
            disabled={
              (tab === "direct" && !selectedUser) ||
              (tab === "group" &&
                (!groupName.trim() || selectedUsers.length === 0)) ||
              (tab === "Venue" && !selectedVenue)
            }
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
