import type uPlot from 'uplot'

import { isNil } from './utils'

/**
 * Improved hover logic for scatter plots
 */
export const getScatterHoverIndex = (u: uPlot, seriesIdx: number) => {
  let hoveredPoint = null
  const isVertical = u.scales.x.ori === 1
  const xProx = 5
  const yProx = isVertical ? xProx : -xProx

  if (seriesIdx !== 0) {
    const cy = isVertical ? u.cursor.left! : u.cursor.top!
    const cx = isVertical ? u.cursor.top! : u.cursor.left!

    const xStartIndex = u.posToIdx(cx - xProx)
    const xEndIndex = u.posToIdx(cx + xProx)
    const lowerYVal = u.posToVal(cy - yProx, 'y')
    const upperYVal = u.posToVal(cy + yProx, 'y')

    for (let i = xStartIndex; i <= xEndIndex; i++) {
      const val = u.data[seriesIdx][i]
      if (isNil(val)) continue
      if (val >= lowerYVal && val <= upperYVal) {
        hoveredPoint = i
        return hoveredPoint
      }
    }
  }
  return hoveredPoint
}
