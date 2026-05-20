import { api } from "@/lib/api";
import type {
  DepositWithCardPayload,
  PayWithCardPayload,
  BaseResponse,
  PayWithWalletPayload,
  WithdrawPayload,
} from "@/types";

export const payWithWallet = async (payload: PayWithWalletPayload) => {
  const res = await api.post<BaseResponse<any>>("/payments/pay/wallet", payload);
  return res.data.data;
};

export const depositWithCard = async (payload: DepositWithCardPayload) => {
  const res = await api.post<BaseResponse<any>>("/payments/deposit/card", payload);
  return res.data.data;
};

export const payWithCard = async (payload: PayWithCardPayload) => {
  const res = await api.post<BaseResponse<any>>("/payments/pay/card", payload);
  return res.data.data;
};

export const withdraw = async (payload: WithdrawPayload) => {
  const res = await api.post<BaseResponse<any>>("/payments/withdraw", payload, {
    headers: { "Idempotency-Key": payload.idempotencyKey },
  });
  return res.data.data;
};
