import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getBillers, getBillerItems, validateCustomer, payBill } from '@/api/bills'
import { getCards } from '@/api/cards'
import { Modal } from '@/components/ui/Modal'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import type { BillCategory, Biller, BillerItem, CustomerValidation } from '@/types'

interface Props {
  category: BillCategory
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'biller' | 'item' | 'customer' | 'confirm' | 'success'

const paySchema = z.object({
  customer: z.string().min(1, 'Enter customer ID / number'),
  amount: z.coerce.number().min(10, 'Minimum ₦10'),
  paymentMethod: z.enum(['wallet', 'card']),
  cardId: z.string().optional(),
})
type PayForm = z.infer<typeof paySchema>

function BillPaymentContent({
  category,
  onSuccess,
}: {
  category: BillCategory
  onSuccess: () => void
}) {
  const [step, setStep] = useState<Step>('biller')
  const [biller, setBiller] = useState<Biller | null>(null)
  const [item, setItem] = useState<BillerItem | null>(null)
  const [validation, setValidation] = useState<CustomerValidation | null>(null)
  const qc = useQueryClient()

  const { data: billers, isLoading: billersLoading } = useQuery({
    queryKey: ['billers', category.code],
    queryFn: () => getBillers(category.code),
  })

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['biller-items', biller?.code],
    queryFn: () => getBillerItems(biller!.code),
    enabled: !!biller,
  })

  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: getCards })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PayForm>({
    resolver: zodResolver(paySchema),
    defaultValues: { paymentMethod: 'wallet', amount: item?.amount ?? 0 },
  })

  const paymentMethod = watch('paymentMethod')

  const { mutate: validate, isPending: validating } = useMutation({
    mutationFn: ({ customer }: { customer: string }) =>
      validateCustomer(item!.code, customer),
    onSuccess: (data) => {
      setValidation(data)
      setStep('confirm')
    },
    onError: () => toast.error('Customer validation failed. Check the details.'),
  })

  const { mutate: pay, isPending: paying } = useMutation({
    mutationFn: (data: PayForm) =>
      payBill(biller!.code, item!.code, {
        billerCode: biller!.code,
        itemCode: item!.code,
        customer: data.customer,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        cardId: data.cardId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      setStep('success')
    },
    onError: () => toast.error('Bill payment failed. Please try again.'),
  })

  // ── Step indicator ─────────────────────────────────────────────────────────
  const steps: Step[] = ['biller', 'item', 'customer', 'confirm']
  const stepIdx = steps.indexOf(step)

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4 animate-fade-in">
        <div className="h-20 w-20 rounded-full gradient-brand flex items-center justify-center shadow-xl shadow-indigo-200">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
        <p className="text-slate-500 text-sm">
          Your {category.name} bill has been paid.
        </p>
        <Button fullWidth onClick={onSuccess} id="bill-done">Done</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Progress steps */}
      <div className="flex gap-2">
        {['Biller', 'Package', 'Details', 'Confirm'].map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                i <= stepIdx ? 'gradient-brand' : 'bg-slate-100'
              }`}
            />
            <span className={`text-[10px] font-semibold ${i <= stepIdx ? 'text-indigo-600' : 'text-slate-300'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step: Select biller */}
      {step === 'biller' && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 mb-3">Select a biller</p>
          {billersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            billers?.map((b) => (
              <button
                key={b.id}
                onClick={() => { setBiller(b); setStep('item') }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
              >
                {b.name}
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))
          )}
        </div>
      )}

      {/* Step: Select item/package */}
      {step === 'item' && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Select package — {biller?.name}
          </p>
          {itemsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            items?.map((it) => (
              <button
                key={it.id}
                onClick={() => { setItem(it); setStep('customer') }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">{it.name}</p>
                  {it.description && <p className="text-xs text-slate-400">{it.description}</p>}
                </div>
                <div className="text-right">
                  {it.amount && (
                    <p className="text-sm font-bold text-indigo-700">{formatCurrency(it.amount)}</p>
                  )}
                  <ChevronRight size={16} className="text-slate-400 ml-auto mt-1" />
                </div>
              </button>
            ))
          )}
          <Button variant="ghost" size="sm" onClick={() => setStep('biller')}>← Back</Button>
        </div>
      )}

      {/* Step: Customer + amount */}
      {step === 'customer' && (
        <form
          onSubmit={handleSubmit((d) => validate({ customer: d.customer }))}
          className="space-y-4"
        >
          <p className="text-sm font-semibold text-slate-700">{item?.name}</p>
          <Input
            id="bill-customer"
            label="Customer ID / Phone / Meter Number"
            type="text"
            placeholder="Enter customer identifier"
            error={errors.customer?.message}
            {...register('customer')}
          />
          <Input
            id="bill-amount"
            label="Amount (₦)"
            type="number"
            placeholder="0"
            error={errors.amount?.message}
            defaultValue={item?.amount}
            {...register('amount')}
          />
          <Button type="submit" fullWidth isLoading={validating} id="bill-validate">
            Validate & Continue
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep('item')}>← Back</Button>
        </form>
      )}

      {/* Step: Confirm payment */}
      {step === 'confirm' && validation && (
        <form onSubmit={handleSubmit((d) => pay(d))} className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Customer</span>
              <span className="font-semibold text-slate-800">{validation.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Package</span>
              <span className="font-semibold text-slate-800">{item?.name}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
              <span className="text-slate-500 font-medium">Total</span>
              <span className="font-bold text-indigo-700 text-base">
                {formatCurrency(validation.amount ?? 0)}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Pay with</label>
            <select
              {...register('paymentMethod')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="wallet">Wallet Balance</option>
              <option value="card">Saved Card</option>
            </select>
          </div>

          {paymentMethod === 'card' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Select Card</label>
              <select
                {...register('cardId')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">-- Choose a card --</option>
                {cards?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand.toUpperCase()} •••• {c.last4}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" fullWidth isLoading={paying} id="bill-pay">
            Pay Now
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep('customer')}>← Back</Button>
        </form>
      )}
    </div>
  )
}

export function BillPaymentFlow({ category, open, onOpenChange }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const content = <BillPaymentContent category={category} onSuccess={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title={`Pay ${category.name}`}>
        {content}
      </BottomSheet>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Pay ${category.name}`} className="max-w-lg">
      {content}
    </Modal>
  )
}
