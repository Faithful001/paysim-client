import { api } from "@/lib/api";
import {
  BaseResponse,
  type PaginatedResponse,
  type Transaction,
  type TransactionFilter,
} from "@/types";

export const getTransactions = async (params: {
  type?: TransactionFilter;
  search?: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Transaction>> => {
  const res = await api.get<BaseResponse<PaginatedResponse<Transaction>>>("/transactions", {
    params,
  });
  return res.data.data;
};

export const getTransaction = async (id: string): Promise<Transaction> => {
  const res = await api.get<BaseResponse<Transaction>>(`/transactions/${id}`);
  return res.data.data;
};

export const getWalletTransactions = async (
  walletId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Transaction>> => {
  const res = await api.get<BaseResponse<PaginatedResponse<Transaction>>>(
    `/transactions/wallet/${walletId}`,
    {
      params,
    }
  );
  return res.data.data;
};
