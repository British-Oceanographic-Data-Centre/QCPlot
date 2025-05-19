import { ReactNode } from 'react'

interface CheckableLabelProps {
  checked?: boolean
  onChange: (val: boolean) => void
  children: ReactNode
}

export const CheckableLabel = ({ checked, onChange, children }: CheckableLabelProps) => (
  <div>
    <label className='check-label'>
      <input type='checkbox' onChange={e => onChange(e.target.checked)} checked={checked} />
      {children}
    </label>
  </div>
)
