import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import { Wallet, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { payWithWallet, payWithCard } from '@/api/payments'
import { getCards } from '@/api/cards'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const walletSchema = z.object({
  amount: z.coerce.number().min(10, 'Minimum ₦10'),
  recipient: z.string().min(1, 'Enter recipient'),
  narration: z.string().optional(),
})

const cardSchema = z.object({
  cardId: z.string().min(1, 'Select a card'),
  amount: z.coerce.number().min(10, 'Minimum ₦10'),
  narration: z.string().optional(),
})

type WalletForm = z.infer<typeof walletSchema>
type CardForm = z.infer<typeof cardSchema>

export function PaymentsPage() {
  const [tab, setTab] = useState('wallet')
  const qc = useQueryClient()
  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: getCards })

  const {
    register: regWallet,
    handleSubmit: handleWallet,
    reset: resetWallet,
    formState: { errors: walletErrors },
  } = useForm<WalletForm>({ resolver: zodResolver(walletSchema) })

  const {
    register: regCard,
    handleSubmit: handleCard,
    reset: resetCard,
    formState: { errors: cardErrors },
  } = useForm<CardForm>({ resolver: zodResolver(cardSchema) })

  const { mutate: payWallet, isPending: payingWallet } = useMutation({
    mutationFn: payWithWallet,
    onSuccess: () => {
      toast.success('Payment successful!')
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      resetWallet()
    },
    onError: () => toast.error('Payment failed. Try again.'),
  })

  const { mutate: payCard, isPending: payingCard } = useMutation({
    mutationFn: payWithCard,
    onSuccess: () => {
      toast.success('Payment successful!')
      qc.invalidateQueries({ queryKey: ['transactions'] })
      resetCard()
    },
    onError: () => toast.error('Card payment failed. Try again.'),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Send money using your wallet or saved card</p>
      </div>

      <Card>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex rounded-xl bg-slate-100 p-1 mb-6">
            {[
              { value: 'wallet', label: 'Pay with Wallet', icon: Wallet },
              { value: 'card', label: 'Pay with Card', icon: CreditCard },
            ].map(({ value, label, icon: Icon }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <Icon size={15} />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="wallet">
            <form
              onSubmit={handleWallet((d) => payWallet(d))}
              className="space-y-4"
            >
              <Input
                id="pay-wallet-recipient"
                label="Recipient"
                type="text"
                placeholder="Account number or email"
                error={walletErrors.recipient?.message}
                {...regWallet('recipient')}
              />
              <Input
                id="pay-wallet-amount"
                label="Amount (₦)"
                type="number"
                placeholder="500"
                error={walletErrors.amount?.message}
                {...regWallet('amount')}
              />
              <Input
                id="pay-wallet-narration"
                label="Narration (optional)"
                type="text"
                placeholder="Payment for..."
                {...regWallet('narration')}
              />
              <Button type="submit" fullWidth isLoading={payingWallet} id="pay-wallet-submit">
                Send Payment
              </Button>
            </form>
          </Tabs.Content>

          <Tabs.Content value="card">
            <form onSubmit={handleCard((d) => payCard(d))} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Select Card</label>
                <select
                  {...regCard('cardId')}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">-- Choose a card --</option>
                  {cards?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand.toUpperCase()} •••• {c.last4}
                    </option>
                  ))}
                </select>
                {cardErrors.cardId && (
                  <p className="text-xs text-red-500">{cardErrors.cardId.message}</p>
                )}
              </div>
              <Input
                id="pay-card-amount"
                label="Amount (₦)"
                type="number"
                placeholder="500"
                error={cardErrors.amount?.message}
                {...regCard('amount')}
              />
              <Input
                id="pay-card-narration"
                label="Narration (optional)"
                type="text"
                placeholder="Payment for..."
                {...regCard('narration')}
              />
              <Button type="submit" fullWidth isLoading={payingCard} id="pay-card-submit">
                Pay with Card
              </Button>
            </form>
          </Tabs.Content>
        </Tabs.Root>
      </Card>
    </div>
  )
}
