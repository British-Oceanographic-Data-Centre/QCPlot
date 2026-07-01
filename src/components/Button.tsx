import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick: () => void
  className?: string
}

/**
 * Styled HTML button.
 */
export const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button
      className={['qcp-button', className].filter(x => !!x).join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
