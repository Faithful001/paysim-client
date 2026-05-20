import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Wifi, Lightbulb, Tv, Phone, MoreHorizontal } from 'lucide-react'
import { getCategories } from '@/api/bills'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { BillPaymentFlow } from '@/components/bills/BillPaymentFlow'
import type { BillCategory } from '@/types'

const categoryIcons: Record<string, { icon: typeof Zap; color: string; bg: string }> = {
  airtime: { icon: Phone, color: 'text-green-600', bg: 'bg-green-50' },
  data: { icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-50' },
  electricity: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  cable: { icon: Tv, color: 'text-purple-600', bg: 'bg-purple-50' },
  default: { icon: MoreHorizontal, color: 'text-slate-600', bg: 'bg-slate-100' },
}

function getCategoryStyle(name: string) {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(categoryIcons)) {
    if (key.includes(k)) return v
  }
  return categoryIcons.default
}

export function BillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['bill-categories'],
    queryFn: getCategories,
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bill Payments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Pay for airtime, data, electricity and more</p>
      </div>

      {!categories?.length ? (
        <EmptyState
          icon={<Zap size={32} />}
          title="No bill categories available"
          description="Bill payment categories will appear here when available."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const { icon: Icon, color, bg } = getCategoryStyle(category.name)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-center"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bg}`}>
                  <Icon size={26} className={color} />
                </div>
                <span className="text-sm font-semibold text-slate-700 leading-tight">
                  {category.name}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selectedCategory && (
        <BillPaymentFlow
          category={selectedCategory}
          open={!!selectedCategory}
          onOpenChange={(open) => { if (!open) setSelectedCategory(null) }}
        />
      )}
    </div>
  )
}
