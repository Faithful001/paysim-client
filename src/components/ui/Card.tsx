import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Card({ children, className, glass, padding = 'md', onClick }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-slate-100 bg-white shadow-sm',
        glass && 'card-glass',
        paddings[padding],
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className,
      )}
    >
      {children}
    </div>
  )
}
