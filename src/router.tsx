import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { BillsPage } from "@/pages/BillsPage";
import { CardsPage } from "@/pages/CardsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { TransactionDetailPage } from "@/pages/TransactionDetailPage";
import { WithdrawPage } from "@/pages/WithdrawPage";

// ── Guards ────────────────────────────────────────────────────────────────────
function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }
}

function requireGuest() {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    throw redirect({ to: "/dashboard" });
  }
}

// ── Root route ────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute();

// ── Public routes ─────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: requireGuest,
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: requireGuest,
  component: RegisterPage,
});

// ── Protected layout ───────────────────────────────────────────────────────────
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: requireAuth,
  component: AppShell,
});

// ── Protected children ─────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const onboardingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/payments",
  component: PaymentsPage,
});

const billsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bills",
  component: BillsPage,
});

const cardsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cards",
  component: CardsPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/transactions/$id",
  component: TransactionDetailPage,
});

const withdrawRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/withdraw",
  component: WithdrawPage,
});

// ── Route tree ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  appRoute.addChildren([
    indexRoute,
    onboardingRoute,
    dashboardRoute,
    paymentsRoute,
    billsRoute,
    cardsRoute,
    transactionsRoute,
    transactionDetailRoute,
    withdrawRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
