import { cn } from "@/lib/utils";
import type { TxStatus, TxType } from "@/types";

interface BadgeProps {
  type?: TxType;
  status?: TxStatus;
  label?: string;
  className?: string;
}

export function Badge({ type, status, label, className }: BadgeProps) {
  if (status) {
    const statusStyles: Record<TxStatus, string> = {
      SUCCESSFUL: "bg-green-50 text-green-700 border border-green-100",
      PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-100",
      FAILED: "bg-red-50 text-red-600 border border-red-100",
      TO_BE_PAID: "bg-red-50 text-red-600 border border-red-100",
      REVERSED: "bg-red-50 text-red-600 border border-red-100",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          statusStyles[status],
          className
        )}
      >
        {label ?? status}
      </span>
    );
  }

  if (type) {
    const typeStyles: Record<TxType, string> = {
      CREDIT: "bg-green-50 text-green-700 border border-green-100",
      DEBIT: "bg-slate-100 text-slate-600 border border-slate-200",
      PAYMENT: "bg-blue-50 text-blue-700 border border-blue-100",
      WITHDRAWAL: "bg-orange-50 text-orange-700 border border-orange-100",
      TRANSFER: "bg-orange-50 text-orange-700 border border-orange-100",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          typeStyles[type],
          className
        )}
      >
        {label ?? type}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600",
        className
      )}
    >
      {label}
    </span>
  );
}
