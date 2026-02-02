import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  icon?: ReactNode
}

export function Card({ title, subtitle, children, className = '', icon }: CardProps) {
  return (
    <div
      className={`
        bg-surface rounded-2xl shadow-sm
        border border-border
        p-5 md:p-6
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="flex items-start gap-3 mb-5">
          {icon && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
