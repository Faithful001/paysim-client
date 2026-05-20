import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  snapPoints?: number[]
  className?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  snapPoints,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'flex flex-col rounded-t-3xl bg-white px-5 pb-8 pt-4',
            'shadow-2xl focus:outline-none max-h-[92dvh]',
            className,
          )}
        >
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

          {(title || description) && (
            <div className="mb-5">
              {title && (
                <Drawer.Title className="text-lg font-bold text-slate-900">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="mt-1 text-sm text-slate-500">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
