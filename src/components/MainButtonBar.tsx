import { RefObject } from 'react'

import { Button } from './Button'

interface MainButtonBarProps {
  flagMode: boolean
  setFlagMode: (val: boolean) => void
  onUnZoom: () => void
  containerRef: RefObject<HTMLDivElement | null>
  enableFlagging: boolean
}

export const MainButtonBar = ({
  flagMode, setFlagMode, onUnZoom, containerRef, enableFlagging
}: MainButtonBarProps) => {
  const toggleDark = () => {
    if (!containerRef.current) return
    if (containerRef.current.className.includes('pnf-dark-mode')) {
      containerRef.current.classList.remove('pnf-dark-mode')
    } else {
      containerRef.current.classList.add('pnf-dark-mode')
    }
  }

  return (
    <div className='pnf-button-bar'>
      {enableFlagging &&
        <Button onClick={() => setFlagMode(!flagMode)}>
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
