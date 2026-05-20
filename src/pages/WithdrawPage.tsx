import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getBanks, verifyAccount } from '@/api/wallet'
import { withdraw } from '@/api/payments'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { generateIdempotencyKey } from '@/lib/utils'

const withdrawSchema = z.object({
  bankCode: z.string().min(1, 'Select a bank'),
  accountNumber: z.string().min(10, 'Account number must be 10 digits').max(10, 'Account number must be 10 digits'),
  amount: z.coerce.number().min(100, 'Minimum withdrawal is ₦100'),
  narration: z.string().optional(),
})

type WithdrawForm = z.infer<typeof withdrawSchema>

export function WithdrawPage() {
  const qc = useQueryClient()
  const [verifiedName, setVerifiedName] = useState<string | null>(null)
  const [isValidatingAccount, setIsValidatingAccount] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [successDetails, setSuccessDetails] = useState<{ amount: number; bankName: string; accountName: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      bankCode: '',
      accountNumber: '',
      amount: 0,
      narration: '',
    },
  })

  const selectedBankCode = watch('bankCode')
  const accountNumber = watch('accountNumber')

  const { data: banks, isLoading: isLoadingBanks } = useQuery({
    queryKey: ['banks'],
    queryFn: getBanks,
  })

  // Verify account number automatically when bank and 10 digit account number are entered
  useEffect(() => {
    if (selectedBankCode && accountNumber && accountNumber.length === 10) {
      const triggerVerification = async () => {
        setIsValidatingAccount(true)
        setVerifiedName(null)
        try {
          const res = await verifyAccount({
            bankCode: selectedBankCode,
            accountNumber,
          })
          setVerifiedName(res.accountName)
          toast.success('Account verified successfully!')
        } catch (err) {
          toast.error('Could not verify account details. Please check and try again.')
          setVerifiedName(null)
        } finally {
          setIsValidatingAccount(false)
        }
      }
      triggerVerification()
    } else {
      setVerifiedName(null)
    }
  }, [selectedBankCode, accountNumber])

  const { mutate: performWithdrawal, isPending: isWithdrawing } = useMutation({
    mutationFn: (data: WithdrawForm) =>
      withdraw({
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        amount: data.amount,
        narration: data.narration,
        idempotencyKey: generateIdempotencyKey(),
      }),
    onSuccess: (_, variables) => {
      const bankName = banks?.find((b) => b.code === variables.bankCode)?.name ?? 'Selected Bank'
      setSuccessDetails({
        amount: variables.amount,
        bankName,
        accountName: verifiedName ?? 'Receiver Account',
      })
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      setStep('success')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Withdrawal failed. Please try again.')
    },
  })

  if (step === 'success' && successDetails) {
    return (
      <div className="flex flex-col items-center text-center py-12 gap-4 animate-fade-in max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full gradient-brand flex items-center justify-center shadow-xl shadow-indigo-200">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Withdrawal Successful!</h3>
        <Card className="w-full p-6 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Amount Sent</span>
            <span className="text-sm font-bold text-slate-800">₦{successDetails.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Destination Bank</span>
            <span className="text-sm font-semibold text-slate-800">{successDetails.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Beneficiary</span>
            <span className="text-sm font-semibold text-slate-800">{successDetails.accountName}</span>
          </div>
        </Card>
        <Button fullWidth onClick={() => { setStep('form'); setVerifiedName(null); setValue('accountNumber', ''); setValue('amount', 0) }}>
          Make Another Withdrawal
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Withdraw Funds</h1>
        <p className="text-sm text-slate-400 mt-0.5">Withdraw funds from your wallet to any Nigerian Bank</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit((d) => performWithdrawal(d))} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Destination Bank</label>
            {isLoadingBanks ? (
              <div className="flex items-center gap-2 h-11 px-4 border border-slate-200 rounded-xl bg-white text-sm text-slate-400">
                <Loader2 className="animate-spin" size={16} /> Loading banks...
              </div>
            ) : (
              <select
                {...register('bankCode')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">-- Choose a Bank --</option>
                {banks?.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
            {errors.bankCode && <p className="text-xs text-red-500">{errors.bankCode.message}</p>}
          </div>

          <Input
            id="withdraw-account-number"
            label="Account Number"
            type="text"
            placeholder="e.g. 0123456789"
            maxLength={10}
            error={errors.accountNumber?.message}
            {...register('accountNumber')}
          />

          {isValidatingAccount && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
              <Loader2 className="animate-spin" size={14} /> Verifying account number details...
            </div>
          )}

          {verifiedName && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-xs font-semibold text-green-700">
              Account Verified: {verifiedName}
            </div>
          )}

          <Input
            id="withdraw-amount"
            label="Amount (₦)"
            type="number"
            placeholder="Minimum ₦100"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Input
            id="withdraw-narration"
            label="Narration / Description (optional)"
            type="text"
            placeholder="Withdrawal reference"
            {...register('narration')}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isWithdrawing}
            disabled={!verifiedName || isValidatingAccount}
            id="withdraw-submit"
          >
            Withdraw Fund
            <ArrowRight size={16} />
          </Button>
        </form>
      </Card>
    </div>
  )
}
