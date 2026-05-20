# Frontend Development Prompt – PaySim Wallet Application

## Project Overview
Build a modern, secure, and intuitive fintech wallet web application called **PaySim**. Users should be able to fund their wallet, link debit cards, pay bills (airtime, data, electricity, etc.), make payments using wallet balance or saved cards, and withdraw to any Nigerian bank.

---

## Tech Stack (Mandatory)

- React 19 + Vite
- TanStack Router (for routing)
- TanStack Query (React Query) v5 for data fetching, caching & mutations
- Tailwind CSS v4
- Radix UI (as base component library) — highly customizable
- React Icons (or Lucide React)
- Zustand or Jotai for global state (auth, wallet balance)
- React Hook Form + Zod for forms
- Modals on Desktop, Bottom Sheets on Mobile (use vaul or custom with Radix)
- Fully responsive (Mobile-first)

---

## Core Features & Flow

### 1. Authentication

Routes:
- `/register` → Register screen (full name, email, phone, password)
- `/login` → Login screen (email + password)

Requirements:
- Protected routes after login
- JWT stored securely (HttpOnly cookie or secure localStorage + refresh logic)

---

### 2. Onboarding / Wallet Creation

After successful registration:
- Automatically create wallet + virtual account

Show success screen with:
- Bank Name (e.g. Wema Bank)
- Account Number (copy button)
- Account Name
- Payment Note (if any)

---

### 3. Dashboard (Home)

Modern fintech layout:

- Header with wallet balance (large, prominent)
- Eye toggle for balance visibility
- Quick actions:
  - Fund Wallet
  - Pay Bills
  - Send Money
  - Withdraw
- Recent transactions (last 5)
- Linked cards summary

---

### 4. Card Linking (Flutterwave) – Critical

Flow:

Button: **Link New Card** → opens modal with form:
- Card Number
- Expiry (MM/YY)
- CVV
- Email

API Flow:
1. POST `/api/v1/payments/cards/direct-charge`
2. Handle Flutterwave response (PIN / OTP / 3DS / redirect)
3. POST `/api/v1/payments/cards/confirm` with `txRef`
4. Show success screen:
   - Card brand
   - Last 4 digits

Important:
- Fully handle all authentication flows (OTP, PIN, redirect, 3DS)

---

### 5. Funding Wallet

Options:

- Card Deposit:
  - POST `/api/v1/payments/deposit/card`

- Bank Transfer:
  - Show virtual account details again

---

### 6. Payments

- Pay with Wallet:
  - POST `/api/v1/payments/pay/wallet`

- Pay with Saved Card:
  - POST `/api/v1/payments/pay/card`

---

### 7. Bill Payments (Very Important)

Flow:

1. GET `/api/v1/payments/bills/categories`
2. Select category → GET billers
3. Select biller → GET items/packages
4. Select item → validate customer:
   - GET `/validate?customer=...`
5. Enter amount + details
6. Pay using wallet or card
   - POST `/payment`

---

### 8. Withdrawals

- POST `/api/v1/payments/withdraw`

Requirements:
- Bank list + account verification
- Idempotency-Key support

---

### 9. Transactions

Features:
- Full transaction history
- Filters:
  - All
  - Credit
  - Debit
  - Bills
  - Withdrawals
- Search by reference
- Pagination

---

## UI/UX Requirements

- Modern fintech aesthetic (Opay / PalmPay / Kuda style)
- Light mode default
- Gradient accents (blue → purple)
- Smooth animations & micro-interactions
- Prominent balance display with eye toggle
- Mobile bottom navigation:
  - Home
  - Payments
  - Bills
  - Cards
  - More

Desktop layout:
- Sidebar navigation

Other:
- Loading states
- Error handling
- Success toasts (sonner or react-hot-toast)
- Empty states with illustrations

---

## All Endpoints to Implement

### Auth
- POST `/auth/register`
- POST `/auth/login`

### Wallet
- GET `/api/v1/wallets`
- GET `/api/v1/wallets/banks`
- POST `/api/v1/wallets/verify-account`

### Linked Cards
- POST `/api/v1/payments/cards/direct-charge`
- POST `/api/v1/payments/cards/confirm`
- GET `/api/v1/payments/cards`
- PATCH `/api/v1/payments/cards/{id}/default`
- DELETE `/api/v1/payments/cards/{id}`

### Payments
- POST `/api/v1/payments/pay/wallet`
- POST `/api/v1/payments/deposit/card`
- POST `/api/v1/payments/pay/card`
- POST `/api/v1/payments/withdraw`

### Bill Payments
- GET `/api/v1/payments/bills/categories`
- GET `/api/v1/payments/bills/categories/{categoryCode}/billers`
- GET `/api/v1/payments/bills/billers/{billerCode}/items`
- GET `/api/v1/payments/bills/items/{itemCode}/validate?customer=...`
- POST `/api/v1/payments/bills/{billerCode}/items/{itemCode}/payment`

### Transactions
- GET `/transactions`
- GET `/transactions/{id}`
- GET `/transactions/wallet/{walletId}`

---

## Deliverables Expected

- Complete folder structure
- Proper route protection
- Reusable components:
  - Card
  - Button
  - Input
  - Modal
  - BottomSheet
  - TransactionItem
- State management for auth + wallet balance
- Comprehensive error handling and loading states
- Mobile-responsive + polished UI

