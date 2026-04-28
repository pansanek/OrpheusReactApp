// components/moderation/ReportsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Check, X, Ban } from "lucide-react";
import {
  ModerationQueueItem,
  ReportStatus,
} from "@/lib/types/moderation.types";

interface ReportsTableProps {
  items: ModerationQueueItem[];
  loading: boolean;
  onSelect: (item: ModerationQueueItem) => void;
  onQuickAction: (id: string, action: "dismiss" | "resolve" | "ban") => void;
  actionLoading: Record<string, boolean>;
}

const statusColors: Record<ReportStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  resolved: "bg-green-100 text-green-800 hover:bg-green-200",
  dismissed: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const typeIcons: Record<string, string> = {
  post: "📝",
  message: "💬",
  profile: "👤",
};

export const ReportsTable = ({
  items,
  loading,
  onSelect,
  onQuickAction,
  actionLoading,
}: ReportsTableProps) => {
  if (loading)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Загрузка репортов...
      </div>
    );
  if (items.length === 0)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Репорты не найдены
      </div>
    );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Автор жалобы</TableHead>
            <TableHead>Цель</TableHead>
            <TableHead>Причина</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ report }) => (
            <TableRow
              key={report.id}
              className={report.status === "pending" ? "bg-muted/30" : ""}
            >
              <TableCell className="font-medium">
                {report.reporterName || report.reporterId}
                {report.status === "pending" && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span>{typeIcons[report.targetType]}</span>
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                    {report.targetId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="capitalize">
                {report.reason.replace("_", " ")}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    statusColors[report.status] || statusColors.pending
                  }
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(report.timestamp).toLocaleString("ru-RU")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading[report.id]}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect({ report })}>
                      <Eye className="w-4 h-4 mr-2" /> Подробнее
                    </DropdownMenuItem>
                    {report.status === "pending" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onQuickAction(report.id, "dismiss")}
                          disabled={actionLoading[report.id]}
                        >
                          <Check className="w-4 h-4 mr-2 text-green-600" />{" "}
                          Отклонить репорт
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onQuickAction(report.id, "resolve")}
                          disabled={actionLoading[report.id]}
                        >
                          <X className="w-4 h-4 mr-2 text-red-600" />{" "}
                          Подтвердить и скрыть
                        </DropdownMenuItem>
                        {report.targetType === "profile" && (
                          <DropdownMenuItem
                            onClick={() => onQuickAction(report.id, "ban")}
                            disabled={actionLoading[`ban_${report.targetId}`]}
                            className="text-orange-600"
                          >
                            <Ban className="w-4 h-4 mr-2" /> Забанить
                            пользователя
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
