// lib/mock-data/moderation.mock.ts
import { ModerationReport } from "../types/moderation.types";

export const MOCK_REPORTS: ModerationReport[] = [
  {
    id: "rep_001",
    reporterId: "user_123",
    reporterName: "Алексей К.",
    targetId: "post_456",
    targetType: "post",
    reason: "spam",
    timestamp: Date.now() - 3600000,
    status: "pending",
  },
  {
    id: "rep_002",
    reporterId: "user_789",
    reporterName: "Мария П.",
    targetId: "msg_101",
    targetType: "message",
    reason: "harassment",
    description: "Оскорбления в личном сообщении",
    timestamp: Date.now() - 7200000,
    status: "pending",
  },
  {
    id: "rep_003",
    reporterId: "user_456",
    targetId: "user_999",
    targetType: "profile",
    reason: "fake_profile",
    timestamp: Date.now() - 86400000,
    status: "resolved",
    reviewedBy: "mod_001",
    reviewedAt: Date.now() - 40000000,
    resolution: "Профиль удалён за фейковые данные",
  },
];
