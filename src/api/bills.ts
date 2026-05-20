import { api } from "@/lib/api";
import {
  BaseResponse,
  type BillCategory,
  type BillPaymentPayload,
  type Biller,
  type BillerItem,
  type CustomerValidation,
} from "@/types";

export const getCategories = async (): Promise<BillCategory[]> => {
  const res = await api.get<BaseResponse<BillCategory[]>>("/payments/bills/categories");
  return res.data.data;
};

export const getBillers = async (categoryCode: string): Promise<Biller[]> => {
  const res = await api.get<BaseResponse<Biller[]>>(
    `/payments/bills/categories/${categoryCode}/billers`
  );
  return res.data.data;
};

export const getBillerItems = async (billerCode: string): Promise<BillerItem[]> => {
  const res = await api.get<BaseResponse<BillerItem[]>>(
    `/payments/bills/billers/${billerCode}/items`
  );
  return res.data.data;
};

export const validateCustomer = async (
  itemCode: string,
  customer: string
): Promise<CustomerValidation> => {
  const res = await api.get<BaseResponse<CustomerValidation>>(
    `/payments/bills/items/${itemCode}/validate`,
    {
      params: { customer },
    }
  );
  return res.data.data;
};

export const payBill = async (
  billerCode: string,
  itemCode: string,
  payload: BillPaymentPayload
) => {
  const res = await api.post<BaseResponse<any>>(
    `/payments/bills/${billerCode}/items/${itemCode}/payment`,
    payload
  );
  return res.data.data;
};
