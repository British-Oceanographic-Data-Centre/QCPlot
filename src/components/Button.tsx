import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick: () => void
}

/**
 * Styled HTML button.
 */
export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      className='pnf-button'
      onClick={onClick}
    >
      {children}
    </button>
  )
}
