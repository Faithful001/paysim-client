import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Building2, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCards } from '@/api/cards'
import { depositWithCard } from '@/api/payments'
import { useWalletStore } from '@/store/walletStore'
import { Modal } from '@/components/ui/Modal'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { copyToClipboard } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const schema = z.object({
  cardId: z.string().min(1, 'Select a card'),
  amount: z.coerce.number().min(100, 'Minimum deposit is ₦100'),
})
type FormData = z.infer<typeof schema>

function FundWalletContent({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState('card')
  const { wallet } = useWalletStore()
  const qc = useQueryClient()

  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: getCards })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: depositWithCard,
    onSuccess: () => {
      toast.success('Deposit successful!')
      qc.invalidateQueries({ queryKey: ['wallet'] })
      onSuccess()
    },
    onError: () => toast.error('Deposit failed. Please try again.'),
  })

  const handleCopy = async (text: string) => {
    await copyToClipboard(text)
    toast.success('Copied!')
  }

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List className="flex rounded-xl bg-slate-100 p-1 mb-6">
        {[
          { value: 'card', label: 'Card Deposit', icon: CreditCard },
          { value: 'transfer', label: 'Bank Transfer', icon: Building2 },
        ].map(({ value, label, icon: Icon }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            <Icon size={15} />
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="card">
        <form onSubmit={handleSubmit((d) => mutate({ cardId: d.cardId, amount: d.amount }))} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Select Card</label>
            <select
              {...register('cardId')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">-- Choose a linked card --</option>
              {cards?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand.toUpperCase()} •••• {c.last4}
                </option>
              ))}
            </select>
            {errors.cardId && <p className="text-xs text-red-500">{errors.cardId.message}</p>}
          </div>

          <Input
            id="fund-amount"
            label="Amount (₦)"
            type="number"
            placeholder="5000"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Button type="submit" fullWidth isLoading={isPending} id="fund-card-submit">
            Deposit Now
          </Button>
        </form>
      </Tabs.Content>

      <Tabs.Content value="transfer">
        <div className="space-y-4">
          <div className="rounded-2xl gradient-brand p-5 text-white">
            <p className="text-xs text-white/70 mb-1">Bank Name</p>
            <p className="font-bold mb-4">{wallet?.virtualAccount?.bankName ?? 'Wema Bank'}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 mb-1">Account Number</p>
                <p className="text-2xl font-bold tracking-widest">
                  {wallet?.virtualAccount?.accountNumber ?? '—'}
                </p>
              </div>
              <button
                onClick={() => handleCopy(wallet?.virtualAccount?.accountNumber ?? '')}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
              >
                <Copy size={14} /> Copy
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-white/70 mb-1">Account Name</p>
              <p className="font-semibold">{wallet?.virtualAccount?.accountName ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-100 p-3">
            <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Transfer any amount to this account and your wallet will be funded automatically within seconds.
            </p>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  )
}

export function FundWalletModal({ open, onOpenChange }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  const content = <FundWalletContent onSuccess={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title="Fund Wallet">
        {content}
      </BottomSheet>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Fund Wallet" description="Choose your preferred funding method.">
      {content}
    </Modal>
  )
}
