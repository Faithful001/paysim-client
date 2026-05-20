import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { directCharge, confirmCard } from '@/api/cards'
import { Modal } from '@/components/ui/Modal'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { DirectChargeResponse } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ── Step 1: Card details form ─────────────────────────────────────────────────
const cardSchema = z.object({
  cardNumber: z.string().min(16, 'Enter a valid card number').max(19),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().min(3, 'Invalid CVV').max(4),
  email: z.string().email('Enter a valid email'),
  amount: z.coerce.number().min(100, 'Minimum ₦100'),
})
type CardForm = z.infer<typeof cardSchema>

// ── Step 2: OTP/PIN form ──────────────────────────────────────────────────────
const otpSchema = z.object({ code: z.string().min(4, 'Enter the code') })
type OtpForm = z.infer<typeof otpSchema>

type Step = 'card' | 'otp' | 'pin' | 'redirect' | 'success'

function LinkCardContent({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>('card')
  const [chargeResponse, setChargeResponse] = useState<DirectChargeResponse | null>(null)
  const [linkedCard, setLinkedCard] = useState<{ brand: string; last4: string } | null>(null)
  const qc = useQueryClient()

  const {
    register: regCard,
    handleSubmit: handleCard,
    formState: { errors: cardErrors },
  } = useForm<CardForm>({ resolver: zodResolver(cardSchema) })

  const {
    register: regOtp,
    handleSubmit: handleOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const { mutate: charge, isPending: charging } = useMutation({
    mutationFn: directCharge,
    onSuccess: (res) => {
      setChargeResponse(res)
      if (res.authMode === 'otp') setStep('otp')
      else if (res.authMode === 'pin') setStep('pin')
      else if (res.authMode === 'redirect' && res.redirectUrl) {
        window.open(res.redirectUrl, '_blank')
        setStep('redirect')
      } else {
        // No auth required
        qc.invalidateQueries({ queryKey: ['cards'] })
        setStep('success')
      }
    },
    onError: () => toast.error('Card charge failed. Check details and try again.'),
  })

  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: confirmCard,
    onSuccess: (card) => {
      setLinkedCard({ brand: card.brand, last4: card.last4 })
      qc.invalidateQueries({ queryKey: ['cards'] })
      setStep('success')
    },
    onError: () => toast.error('Confirmation failed. Please try again.'),
  })

  const onCardSubmit = (data: CardForm) => {
    charge({
      cardNumber: data.cardNumber.replace(/\s/g, ''),
      expiry: data.expiry,
      cvv: data.cvv,
      email: data.email,
      amount: data.amount,
    })
  }

  const onOtpSubmit = (data: OtpForm) => {
    if (!chargeResponse) return
    confirm({
      txRef: chargeResponse.txRef,
      ...(step === 'otp' ? { otp: data.code } : { pin: data.code }),
    })
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4 animate-fade-in">
        <div className="h-20 w-20 rounded-full gradient-brand flex items-center justify-center shadow-xl shadow-indigo-200">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Card Linked!</h3>
        {linkedCard && (
          <p className="text-slate-500 text-sm">
            <span className="font-semibold capitalize">{linkedCard.brand}</span> ending in{' '}
            <span className="font-semibold">{linkedCard.last4}</span> has been saved.
          </p>
        )}
        <Button fullWidth onClick={onSuccess} id="link-card-done">
          Done
        </Button>
      </div>
    )
  }

  // ── Redirect ────────────────────────────────────────────────────────────────
  if (step === 'redirect') {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4">
        <ShieldCheck size={48} className="text-indigo-500" />
        <h3 className="text-base font-bold text-slate-900">Complete 3DS Verification</h3>
        <p className="text-sm text-slate-500">
          A new tab has opened for card verification. Return here once done.
        </p>
        <Button
          fullWidth
          onClick={() =>
            chargeResponse && confirm({ txRef: chargeResponse.txRef })
          }
          isLoading={confirming}
          id="link-card-3ds-done"
        >
          I&apos;ve Completed Verification
        </Button>
      </div>
    )
  }

  // ── OTP / PIN ───────────────────────────────────────────────────────────────
  if (step === 'otp' || step === 'pin') {
    return (
      <form onSubmit={handleOtp(onOtpSubmit)} className="space-y-5 animate-fade-in">
        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <ShieldCheck size={24} className="text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900">
            {step === 'otp' ? 'Enter OTP' : 'Enter Card PIN'}
          </h3>
          <p className="text-xs text-slate-500">
            {step === 'otp'
              ? 'Enter the one-time password sent to your phone/email.'
              : 'Enter your 4-digit card PIN to authorise.'}
          </p>
        </div>
        <Input
          id="link-card-code"
          label={step === 'otp' ? 'OTP Code' : 'Card PIN'}
          type={step === 'pin' ? 'password' : 'text'}
          placeholder={step === 'otp' ? '123456' : '••••'}
          maxLength={step === 'pin' ? 4 : 6}
          error={otpErrors.code?.message}
          {...regOtp('code')}
        />
        <Button type="submit" fullWidth isLoading={confirming} id="link-card-confirm">
          Confirm
        </Button>
      </form>
    )
  }

  // ── Step 1: Card form ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleCard(onCardSubmit)} className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 mb-2">
        <CreditCard size={20} className="text-indigo-600" />
        <p className="text-sm text-indigo-700 font-medium">Enter your debit card details securely.</p>
      </div>
      <Input
        id="link-card-number"
        label="Card Number"
        type="text"
        placeholder="0000 0000 0000 0000"
        maxLength={19}
        error={cardErrors.cardNumber?.message}
        {...regCard('cardNumber')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="link-card-expiry"
          label="Expiry (MM/YY)"
          type="text"
          placeholder="08/27"
          maxLength={5}
          error={cardErrors.expiry?.message}
          {...regCard('expiry')}
        />
        <Input
          id="link-card-cvv"
          label="CVV"
          type="password"
          placeholder="•••"
          maxLength={4}
          error={cardErrors.cvv?.message}
          {...regCard('cvv')}
        />
      </div>
      <Input
        id="link-card-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={cardErrors.email?.message}
        {...regCard('email')}
      />
      <Input
        id="link-card-amount"
        label="Charge Amount (₦)"
        type="number"
        placeholder="100"
        hint="A small charge is made to verify your card"
        error={cardErrors.amount?.message}
        {...regCard('amount')}
      />
      <Button type="submit" fullWidth isLoading={charging} id="link-card-submit">
        Link Card
      </Button>
    </form>
  )
}

export function LinkCardModal({ open, onOpenChange }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  const content = <LinkCardContent onSuccess={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title="Link New Card">
        {content}
      </BottomSheet>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Link New Card" description="Add a debit card for fast payments.">
      {content}
    </Modal>
  )
}
