import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
}

const base = 'inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

const variants: Record<string, string> = {
  default: 'bg-white border border-[var(--border-color)] text-[var(--editor-text)] hover:bg-[var(--surface-hover)]',
  ghost: 'text-[var(--editor-text)] hover:bg-[var(--surface-hover)] border border-transparent',
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 border border-transparent',
}

const sizes: Record<string, string> = {
  sm: 'h-7 px-2.5 text-[11px]',
  md: 'h-8 px-3',
}

export function Button({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
