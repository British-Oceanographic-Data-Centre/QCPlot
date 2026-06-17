import type uPlot from 'uplot'

import { clearSelection } from './flagUtils'

/**
 * Toggle dark mode.
 */
export const toggleDark = () => {
  const container = document.querySelector('.pnf-container')
  if (!container) return
  if (container.className.includes('pnf-dark-mode')) {
    container.classList.remove('pnf-dark-mode')
  } else {
    container.classList.add('pnf-dark-mode')
  }
}

/**
 * Updates various UI components and uPlot properties when toggling flag mode on/off.
 */
export const updateFlagModeState = (u: uPlot, isActive: boolean) => {
  if (isActive) {
    u.root.querySelector('.u-select')?.classList.add('pnf-flag-select')
    document.querySelector('.pnf-flag-controls')?.classList.remove('pnf-hidden')
  } else {
    u.root.querySelector('.u-select')?.classList.remove('pnf-flag-select')
    document.querySelector('.pnf-flag-controls')?.classList.add('pnf-hidden')
    clearSelection(u)
  }

  document.querySelector('.pnf-toggle-flag-mode-btn')!.textContent = `Toggle Flag Mode - ${isActive ? 'on' : 'off'}`

  u.cursor.drag!.setScale = !isActive
}
