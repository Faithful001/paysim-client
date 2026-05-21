export type BaseResponse<T> = {
  success: boolean;
  statusCode: string;
  message: string;
  data: T;
};

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export type AuthResponse = {
  token: string;
  user: User;
};

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Wallet ────────────────────────────────────────────────────────────────
export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentNote?: string;
}

export interface Wallet {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    bvn: string | null;
    createdAt: string;
    updatedAt: string;
  };
  currency: string;
  balance: number;
  status: string;
  failureReason: string | null;
  accountNumber: string;
  bankName: string;
  providerRef: string;
  orderRef: string;
  paymentNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Cards ─────────────────────────────────────────────────────────────────
export interface LinkedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: string;
}

export type CardAuthMode = "pin" | "otp" | "3ds" | "redirect" | "none";

export interface DirectChargePayload {
  cardNumber: string;
  expiry: string;
  cvv: string;
  email: string;
  amount: number;
}

export interface DirectChargeResponse {
  status: string;
  authMode: CardAuthMode;
  txRef: string;
  redirectUrl?: string;
  message?: string;
}

export interface ConfirmCardPayload {
  txRef: string;
  otp?: string;
  pin?: string;
}

// ─── Payments ──────────────────────────────────────────────────────────────
export interface PayWithWalletPayload {
  amount: number;
  recipient: string;
  narration?: string;
}

export interface DepositWithCardPayload {
  cardId: string;
  amount: number;
}

export interface PayWithCardPayload {
  cardId: string;
  amount: number;
  narration?: string;
}

export interface WithdrawPayload {
  bankCode: string;
  accountNumber: string;
  amount: number;
  narration?: string;
  idempotencyKey: string;
}

export interface Bank {
  id: number;
  code: string;
  name: string;
}

export interface AccountVerification {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

// ─── Bills ─────────────────────────────────────────────────────────────────
export interface BillCategory {
  id: string;
  code: string;
  name: string;
  icon?: string;
}

export interface Biller {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  short_name: string;
  biller_code: string;
  country_code: string;
}

export interface BillerItem {
  id: number;
  biller_code: string;
  name: string;
  default_commission: number;
  date_added: string;
  country: string;
  is_airtime: boolean;
  biller_name: string;
  item_code: string;
  short_name: string;
  fee: number;
  commission_on_fee: boolean;
  reg_expression: string;
  label_name: string;
  amount: number | null;
  is_resolvable: boolean;
  group_name: string;
  category_name: string;
  is_data: boolean | null;
  default_commission_on_amount: number | null;
  commission_on_fee_or_amount: boolean | null;
  validity_period: string | null;
}

export interface CustomerValidation {
  customerName: string;
  customerAddress?: string;
  amount?: number;
}

export interface BillPaymentPayload {
  billerCode: string;
  itemCode: string;
  customer: string;
  amount: number;
  paymentMethod: "wallet" | "card";
  cardId?: string;
}

// ─── Transactions ──────────────────────────────────────────────────────────
export type TxType = "CREDIT" | "DEBIT" | "TRANSFER" | "WITHDRAWAL" | "PAYMENT";
export type TxStatus = "SUCCESSFUL" | "PENDING" | "FAILED" | "TO_BE_PAID" | "REVERSED";

export interface Transaction {
  id: string;
  walletId: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  narration: string;
  reference: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type TransactionFilter = "ALL" | TxType;
