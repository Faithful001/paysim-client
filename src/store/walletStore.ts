import { create } from 'zustand'
import type { Wallet } from '@/types'

interface WalletState {
  wallet: Wallet | null
  balanceVisible: boolean
  setWallet: (wallet: Wallet) => void
  toggleBalance: () => void
  clearWallet: () => void
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallet: null,
  balanceVisible: true,

  setWallet: (wallet) => set({ wallet }),

  toggleBalance: () => set((s) => ({ balanceVisible: !s.balanceVisible })),

  clearWallet: () => set({ wallet: null }),
}))
