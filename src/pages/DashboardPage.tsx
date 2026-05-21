import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Plus,
  Zap,
  ArrowUpRight,
  ArrowDownToLine,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { getWallet } from "@/api/wallet";
import { getTransactions } from "@/api/transactions";
import { getCards } from "@/api/cards";
import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { TransactionItem } from "@/components/ui/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { FundWalletModal } from "@/components/wallet/FundWalletModal";
import { formatCurrency, maskBalance } from "@/lib/utils";

const quickActions = [
  { label: "Fund Wallet", icon: Plus, color: "bg-indigo-50 text-indigo-600", action: "fund" },
  { label: "Pay Bills", icon: Zap, color: "bg-purple-50 text-purple-600", action: "bills" },
  {
    label: "Send Money",
    icon: ArrowUpRight,
    color: "bg-blue-50 text-blue-600",
    action: "payments",
  },
  {
    label: "Withdraw",
    icon: ArrowDownToLine,
    color: "bg-green-50 text-green-600",
    action: "withdraw",
  },
] as const;

export function DashboardPage() {
  const [fundOpen, setFundOpen] = useState(false);
  const { wallet, setWallet, balanceVisible, toggleBalance } = useWalletStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", { size: 5 }],
    queryFn: () => getTransactions({ size: 5 }),
  });

  const { data: cardsData } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
  });

  useEffect(() => {
    if (walletData) setWallet(walletData);
  }, [walletData, setWallet]);

  const handleAction = (action: string) => {
    if (action === "fund") {
      setFundOpen(true);
      return;
    }
    navigate({ to: `/${action}` as "/bills" | "/payments" | "/withdraw" });
  };

  if (walletLoading) return <PageSpinner />;

  const balance = wallet?.balance ?? walletData?.balance ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-sm text-slate-400 font-medium">Good day,</p>
        <h1 className="text-xl font-bold text-slate-900">
          {user?.firstName && user?.lastName ? user?.firstName + " " + user?.lastName : "there"} 👋
        </h1>
      </div>

      {/* Balance card */}
      <div className="gradient-brand rounded-2xl p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/80 text-sm font-medium">Wallet Balance</p>
            <button
              onClick={toggleBalance}
              className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30 transition-colors"
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <p className="text-4xl font-bold tracking-tight mb-1">
            {balanceVisible ? formatCurrency(balance) : maskBalance(balance)}
          </p>
          <p className="text-white/60 text-xs">
            {wallet?.accountNumber ? `Account no: ${wallet?.accountNumber}` : "Available balance"}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map(({ label, icon: Icon, color, action }) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-slate-100 p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-600 text-center leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Linked cards summary */}
      {cardsData && cardsData.length > 0 && (
        <Card padding="sm">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <p className="text-sm font-bold text-slate-800">Linked Cards</p>
            <button
              onClick={() => navigate({ to: "/cards" })}
              className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 px-1">
            {cardsData.slice(0, 3).map((card) => (
              <div
                key={card.id}
                className="flex-shrink-0 rounded-xl gradient-brand p-3 text-white w-36 shadow-md shadow-indigo-200"
              >
                <p className="text-xs text-white/70 font-medium mb-3 capitalize">{card.brand}</p>
                <p className="text-sm font-bold tracking-widest">•••• {card.last4}</p>
                {card.isDefault && (
                  <span className="mt-2 inline-block text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Recent Transactions</h2>
          <button
            onClick={() => navigate({ to: "/transactions" })}
            className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        {txLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-3.5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : txData?.data?.length ? (
          <div>
            {txData.data.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={() => navigate({ to: "/transactions/$id", params: { id: tx.id } })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Receipt size={32} />}
            title="No transactions yet"
            description="Your recent transactions will appear here after you fund your wallet."
          />
        )}
      </Card>

      <FundWalletModal open={fundOpen} onOpenChange={setFundOpen} />
    </div>
  );
}
