import { ReactNode, useContext } from 'react'

import { ChartContext } from '@/ChartContext'

interface ButtonProps {
  children: ReactNode
  onClick: () => void
}

/**
 * Styled HTML button.
 */
export const Button = ({ children, onClick }: ButtonProps) => {
  const { buttonClassname } = useContext(ChartContext)

  return (
    <button
      className={buttonClassname || 'pnf-button'}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
