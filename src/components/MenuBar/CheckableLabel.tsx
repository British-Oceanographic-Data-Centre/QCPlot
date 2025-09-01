import { ReactNode } from 'react'

interface CheckableLabelProps {
  checked?: boolean
  onChange: (val: boolean) => void
  children: ReactNode
  tooltip?: string
}

/**
 * Text label with accompanying checkbox.
 */
export const CheckableLabel = ({ checked, onChange, children, tooltip }: CheckableLabelProps) => (
  <div>
    <label className='pnf-check-label' title={tooltip}>
      <input type='checkbox' onChange={e => onChange(e.target.checked)} checked={checked} />
      {children}
    </label>
  </div>
)
