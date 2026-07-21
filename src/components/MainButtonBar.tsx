import { Button } from './Button'
import { toggleDark } from '@/domUtils'

interface MainButtonBarProps {
  flagMode: boolean
  toggleFlagMode: () => void
  onUnZoom: () => void
  enableFlagging: boolean
}

/**
 * Container for various toggle buttons that are always present in the UI.
 */
export const MainButtonBar = ({ flagMode, toggleFlagMode, onUnZoom, enableFlagging }: MainButtonBarProps) => {
  return (
    <div className='qcp-button-bar'>
      {enableFlagging &&
        <Button className='qcp-toggle-flag-mode-btn' onClick={toggleFlagMode}>
          Toggle Flag Mode - {flagMode ? 'on' : 'off'}
        </Button>
      }
      <Button onClick={onUnZoom}>
        Reset Zoom
      </Button>
      <Button onClick={toggleDark}>
        Toggle Dark Mode
      </Button>
    </div>
  )
}
