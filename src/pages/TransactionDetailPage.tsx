import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { getTransaction } from '@/api/transactions'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate, copyToClipboard } from '@/lib/utils'

export function TransactionDetailPage() {
  const { id } = useParams({ from: '/app/transactions/$id' })
  const navigate = useNavigate()

  const { data: tx, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransaction(id),
  })

  if (isLoading) return <PageSpinner />
  if (!tx) return <p className="text-center py-12 text-slate-400">Transaction not found.</p>

  const isCredit = tx.type === 'credit'

  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <button
        onClick={() => navigate({ to: '/transactions' })}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Transactions
      </button>

      <Card>
        <div className="text-center py-6 border-b border-slate-100">
          <p className={`text-4xl font-bold tabular-nums ${isCredit ? 'text-green-600' : 'text-slate-900'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
          </p>
          <p className="text-sm text-slate-400 mt-2">{tx.narration}</p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge type={tx.type} />
            <Badge status={tx.status} />
          </div>
        </div>

        <div className="pt-5 space-y-4">
          {[
            { label: 'Date', value: formatDate(tx.createdAt) },
            { label: 'Type', value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1) },
            { label: 'Status', value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-400">Reference</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-800 text-right max-w-[160px] break-all">
                {tx.reference}
              </span>
              <button
                onClick={async () => { await copyToClipboard(tx.reference); toast.success('Copied!') }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Copy size={13} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Button variant="outline" fullWidth onClick={() => navigate({ to: '/transactions' })}>
        Back to Transactions
      </Button>
    </div>
  )
}
