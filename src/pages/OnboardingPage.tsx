import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getWallet } from "@/api/wallet";
import { useWalletStore } from "@/store/walletStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { copyToClipboard } from "@/lib/utils";
import { useEffect } from "react";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setWallet, wallet } = useWalletStore();

  const { data, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });

  useEffect(() => {
    if (data) setWallet(data);
  }, [data, setWallet]);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full gradient-brand flex items-center justify-center shadow-2xl shadow-indigo-300 animate-pulse-ring">
              <CheckCircle2 size={44} className="text-white" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Wallet Created! 🎉</h1>
          <p className="text-slate-500 text-sm">
            Your virtual account is ready. Fund it via bank transfer below.
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Building2 size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Virtual Bank Account</p>
              <p className="text-sm font-bold text-slate-800">{wallet?.bankName ?? "--"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Account Number</p>
                <p className="text-2xl font-bold tracking-widest text-slate-900">
                  {wallet?.accountNumber ?? "--"}
                </p>
              </div>
              <button
                onClick={() => handleCopy(wallet?.accountNumber ?? "")}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Copy size={14} />
                Copy
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account Name</p>
              <p className="text-sm font-semibold text-slate-800">
                {wallet?.user?.firstName || wallet?.user?.lastName
                  ? wallet?.user?.firstName + " " + wallet?.user?.lastName
                  : "--"}
              </p>
            </div>

            {wallet?.paymentNote && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Note:</span> {wallet.paymentNote}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Button
          fullWidth
          size="lg"
          onClick={() => navigate({ to: "/dashboard" })}
          id="onboarding-continue"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
