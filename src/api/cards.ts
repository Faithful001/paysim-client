import { api } from "@/lib/api";
import type {
  BaseResponse,
  ConfirmCardPayload,
  DirectChargePayload,
  DirectChargeResponse,
  LinkedCard,
} from "@/types";

export const directCharge = async (payload: DirectChargePayload): Promise<DirectChargeResponse> => {
  const res = await api.post<BaseResponse<DirectChargeResponse>>(
    "/payments/cards/direct-charge",
    payload
  );
  return res.data.data;
};

export const confirmCard = async (payload: ConfirmCardPayload): Promise<LinkedCard> => {
  const res = await api.post<BaseResponse<LinkedCard>>("/payments/cards/confirm", payload);
  return res.data.data;
};

export const getCards = async (): Promise<LinkedCard[]> => {
  const res = await api.get<BaseResponse<LinkedCard[]>>("/payments/cards");
  return res.data.data;
};

export const setDefaultCard = async (id: string): Promise<LinkedCard> => {
  const res = await api.patch<BaseResponse<LinkedCard>>(`/payments/cards/${id}/default`);
  return res.data.data;
};

export const deleteCard = async (id: string): Promise<any> => {
  const res = await api.delete<BaseResponse<any>>(`/payments/cards/${id}`);
  return res.data.data;
};
