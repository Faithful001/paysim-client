import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Plus, Star, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCards, setDefaultCard, deleteCard } from '@/api/cards'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { LinkCardModal } from '@/components/cards/LinkCardModal'
import { cn } from '@/lib/utils'

const brandColors: Record<string, string> = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-red-500 to-orange-600',
  verve: 'from-green-600 to-emerald-700',
  default: 'from-indigo-600 to-purple-700',
}

export function CardsPage() {
  const [linkOpen, setLinkOpen] = useState(false)
  const qc = useQueryClient()

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  })

  const { mutate: makeDefault, isPending: settingDefault } = useMutation({
    mutationFn: setDefaultCard,
    onSuccess: () => {
      toast.success('Default card updated')
      qc.invalidateQueries({ queryKey: ['cards'] })
    },
    onError: () => toast.error('Failed to update default card'),
  })

  const { mutate: removeCard, isPending: deleting } = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      toast.success('Card removed')
      qc.invalidateQueries({ queryKey: ['cards'] })
    },
    onError: () => toast.error('Failed to remove card'),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Linked Cards</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your saved payment cards</p>
        </div>
        <Button size="sm" onClick={() => setLinkOpen(true)} id="add-card-btn">
          <Plus size={16} />
          Add Card
        </Button>
      </div>

      {!cards?.length ? (
        <EmptyState
          icon={<CreditCard size={36} />}
          title="No cards linked yet"
          description="Link a debit card to fund your wallet and make payments faster."
          action={
            <Button onClick={() => setLinkOpen(true)} id="link-first-card">
              <Plus size={16} /> Link a Card
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {cards.map((card) => {
            const gradient = brandColors[card.brand.toLowerCase()] ?? brandColors.default
            return (
              <Card key={card.id} padding="none" className="overflow-hidden">
                {/* Card visual */}
                <div className={cn('bg-gradient-to-br p-5 text-white relative overflow-hidden', gradient)}>
                  <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/10" />
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <p className="text-xs text-white/60 font-medium uppercase tracking-widest">
                        {card.brand}
                      </p>
                      {card.isDefault && (
                        <Badge label="Default" className="bg-white/20 text-white border-white/20" />
                      )}
                    </div>
                    <p className="text-xl font-bold tracking-[0.25em] mb-4">
                      •••• •••• •••• {card.last4}
                    </p>
                    <p className="text-xs text-white/60">
                      Expires {card.expiryMonth}/{card.expiryYear}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 p-4 bg-white border-t border-slate-100">
                  {!card.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => makeDefault(card.id)}
                      isLoading={settingDefault}
                    >
                      <Star size={14} />
                      Set Default
                    </Button>
                  )}
                  {card.isDefault && (
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                      <CheckCircle2 size={14} />
                      Default card
                    </div>
                  )}
                  <div className="ml-auto">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeCard(card.id)}
                      isLoading={deleting}
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <LinkCardModal open={linkOpen} onOpenChange={setLinkOpen} />
    </div>
  )
}
