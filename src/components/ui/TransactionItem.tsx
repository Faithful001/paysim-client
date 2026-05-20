import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from './Badge'
import type { Transaction } from '@/types'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Banknote,
} from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

const typeIcons = {
  credit: { icon: ArrowDownLeft, bg: 'bg-green-50', color: 'text-green-600' },
  debit: { icon: ArrowUpRight, bg: 'bg-slate-100', color: 'text-slate-600' },
  bill: { icon: Zap, bg: 'bg-blue-50', color: 'text-blue-600' },
  withdrawal: { icon: Banknote, bg: 'bg-orange-50', color: 'text-orange-600' },
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { icon: Icon, bg, color } = typeIcons[transaction.type]
  const isCredit = transaction.type === 'credit'

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 py-4 border-b border-slate-50 last:border-0',
        onClick && 'cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition-colors',
      )}
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', bg)}>
        <Icon size={20} className={color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{transaction.narration}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(transaction.createdAt)}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            isCredit ? 'text-green-600' : 'text-slate-800',
          )}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </span>
        <Badge status={transaction.status} />
      </div>
    </div>
  )
}
