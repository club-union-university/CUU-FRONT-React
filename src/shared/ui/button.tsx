import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none rounded-md',
  {
    variants: {
      variant: {
        primary:
          'bg-(--color-brand) text-(--color-fg-on-brand) hover:bg-(--color-brand-hover) active:bg-(--color-brand-active)',
        secondary:
          'bg-(--color-bg-subtle) text-(--color-fg-default) hover:bg-(--color-bg-muted)',
        outline:
          'border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-fg-default) hover:bg-(--color-bg-subtle)',
        ghost:
          'bg-transparent text-(--color-fg-default) hover:bg-(--color-bg-subtle)',
        danger:
          'bg-(--color-status-danger) text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
