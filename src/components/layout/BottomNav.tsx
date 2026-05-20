import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, ArrowDownToLine, Zap, CreditCard, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Payments', to: '/payments', icon: ArrowDownToLine },
  { label: 'Bills', to: '/bills', icon: Zap },
  { label: 'Cards', to: '/cards', icon: CreditCard },
  { label: 'More', to: '/transactions', icon: MoreHorizontal },
]

export function BottomNav() {
  const { location } = useRouterState()

  return (
    <nav className="flex items-center justify-around bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 py-2 safe-area-inset-bottom">
      {navItems.map(({ label, to, icon: Icon }) => {
        const active = location.pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150"
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                active ? 'gradient-brand shadow-md shadow-indigo-200' : 'text-slate-400',
              )}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
            </div>
            <span
              className={cn(
                'text-[10px] font-semibold tracking-wide',
                active ? 'text-indigo-600' : 'text-slate-400',
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
