import { RefObject } from 'react'

import type uPlot from 'uplot'

import { Button } from './Button'

interface MainButtonBarProps {
  flagMode: boolean
  setFlagMode: (val: boolean) => void
  plotRef: RefObject<uPlot | null>
  containerRef: RefObject<HTMLDivElement | null>
}

export const MainButtonBar = ({ flagMode, setFlagMode, plotRef, containerRef }: MainButtonBarProps) => {
  const onUnZoom = () => {
    const u = plotRef.current
    if (!u) return
    u.setScale('x', { min: u.data[0][0], max: u.data[0][u.data[0].length - 1] })
  }

  const toggleDark = () => {
    if (!containerRef.current) return
    if (containerRef.current.className.includes('dark-mode')) {
      containerRef.current.classList.remove('dark-mode')
    } else {
      containerRef.current.classList.add('dark-mode')
    }
  }

  return (
    <div className='button-bar'>
      <Button onClick={() => setFlagMode(!flagMode)}>
        Toggle Flag Mode - {flagMode ? 'on' : 'off'}
      </Button>
      <Button onClick={onUnZoom}>
        Reset Zoom
      </Button>
      <Button onClick={toggleDark}>
        Toggle Dark Mode
      </Button>
    </div>
  )
}
