import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search, Receipt, SlidersHorizontal } from "lucide-react";
import { getTransactions } from "@/api/transactions";
import { TransactionItem } from "@/components/ui/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { TransactionFilter } from "@/types";

const filters: { label: string; value: TransactionFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Credit", value: "CREDIT" },
  { label: "Debit", value: "DEBIT" },
  { label: "Payment", value: "PAYMENT" },
  { label: "Withdrawal", value: "WITHDRAWAL" },
  { label: "Transfers", value: "TRANSFER" },
];

const PAGE_SIZE = 20;

export function TransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["transactions", { filter, search, page }],
    queryFn: () =>
      getTransactions({
        type: filter === "ALL" ? undefined : (filter as TransactionFilter),
        // search,
        page,
        size: PAGE_SIZE,
      }),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-400 mt-0.5">Full history of your wallet activity</p>
      </div>

      {/* Search */}
      <Input
        id="tx-search"
        placeholder="Search by reference..."
        leftIcon={<Search size={16} />}
        rightIcon={<SlidersHorizontal size={16} />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
            className={cn(
              "flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150",
              filter === value
                ? "gradient-brand text-white shadow-md shadow-indigo-200"
                : "bg-white border border-slate-100 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title="No transactions found"
          description={
            search ? `No results for "${search}"` : "Your transactions will appear here."
          }
        />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 divide-y divide-slate-50">
          {data.data.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={() => navigate({ to: "/transactions/$id", params: { id: tx.id } })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400">
            Page {page} of {Math.ceil(data.total / PAGE_SIZE)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.hasMore || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
