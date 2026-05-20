import { api } from "@/lib/api";
import type { AuthResponse, BaseResponse, LoginPayload, RegisterPayload } from "@/types";

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post<BaseResponse<AuthResponse>>("/auth/register", payload);
  return res.data.data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<BaseResponse<AuthResponse>>("/auth/login", payload);
  return res.data.data;
};
