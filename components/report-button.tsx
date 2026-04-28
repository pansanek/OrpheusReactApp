// components/ReportButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

import { UseReportContentOptions } from "@/hooks/useReportContent";
import { ReportModal } from "./report-modal";

interface ReportButtonProps {
  options: UseReportContentOptions;
  className?: string;
  iconOnly?: boolean;
}

export const ReportButton = ({
  options,
  className,
  iconOnly = false,
}: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size={iconOnly ? "icon" : "sm"}
        className={`text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Flag className="w-4 h-4" />
        {!iconOnly && <span className="ml-1.5 text-sm">Пожаловаться</span>}
      </Button>

      <ReportModal options={options} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
