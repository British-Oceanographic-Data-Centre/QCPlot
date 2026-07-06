import { ReactNode } from 'react'

interface CheckableLabelProps {
  defaultChecked?: boolean
  onChange: (val: boolean) => void
  children: ReactNode
  tooltip?: string
  inputClass?: string
}

/**
 * Text label with accompanying checkbox.
 */
export const CheckableLabel = ({ defaultChecked, onChange, children, tooltip, inputClass }: CheckableLabelProps) => (
  <div>
    <label className='qcp-check-label' title={tooltip}>
      <input
        type='checkbox'
        className={inputClass}
        onChange={e => onChange(e.target.checked)}
        defaultChecked={defaultChecked}
      />
      {children}
    </label>
  </div>
)
