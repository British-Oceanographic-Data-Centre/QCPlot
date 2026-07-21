import type uPlot from 'uplot'

import { clearSelection } from './flagUtils'

/**
 * Toggle dark mode.
 */
export const toggleDark = () => {
  const container = document.querySelector('.qcp-container')
  if (!container) return
  if (container.className.includes('qcp-dark-mode')) {
    container.classList.remove('qcp-dark-mode')
  } else {
    container.classList.add('qcp-dark-mode')
  }
}

/**
 * Toggle fullscreen mode.
 */
export const toggleFullscreen = (u: uPlot, regularHeight: number) => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    u.setSize({
      width: u.width,
      height: regularHeight
    })
  } else {
    const container = document.querySelector('.qcp-container')
    const legend = document.querySelector('.u-legend')
    const menuBar = document.querySelector('.qcp-menu-bar')
    const controlBars = document.querySelectorAll('.qcp-control-bar-outer')
    container?.requestFullscreen()
    u.setSize({
      width: u.width,
      height: window.screen.height -
              legend!.clientHeight -
              menuBar!.clientHeight -
              Array.from(controlBars).map(x => x.clientHeight).reduce((a, b) => a + b)
    })
  }
}

/**
 * Updates various UI components and uPlot properties when toggling flag mode on/off.
 */
export const updateFlagModeState = (u: uPlot, isActive: boolean) => {
  if (isActive) {
    u.root.querySelector('.u-select')?.classList.add('qcp-flag-select')
    document.querySelector('.qcp-flag-controls')?.classList.remove('qcp-hidden')
  } else {
    u.root.querySelector('.u-select')?.classList.remove('qcp-flag-select')
    document.querySelector('.qcp-flag-controls')?.classList.add('qcp-hidden')
    clearSelection(u)
  }

  document.querySelector('.qcp-toggle-flag-mode-btn')!.textContent = `Toggle Flag Mode - ${isActive ? 'on' : 'off'}`

  u.cursor.drag!.setScale = !isActive
}
