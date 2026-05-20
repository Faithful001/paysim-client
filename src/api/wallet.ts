import { api } from "@/lib/api";
import { BaseResponse, type AccountVerification, type Bank, type Wallet } from "@/types";

export const getWallet = async (): Promise<Wallet> => {
  const res = await api.get<BaseResponse<Wallet>>("/wallets");
  return res.data.data;
};

export const getBanks = async (): Promise<Bank[]> => {
  const res = await api.get<BaseResponse<Bank[]>>("/wallets/banks");
  return res.data.data;
};

export const verifyAccount = async (payload: {
  bankCode: string;
  accountNumber: string;
}): Promise<AccountVerification> => {
  const res = await api.post<BaseResponse<AccountVerification>>("/wallets/verify-account", payload);
  return res.data.data;
};
