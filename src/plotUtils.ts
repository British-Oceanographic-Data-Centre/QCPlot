import { RefObject } from 'react'

import type uPlot from 'uplot'

import { NamedSeries } from './types'
import { isNil, splitTraceName } from './utils'

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

/**
 * Updates the displayed series within the plot.
 */
export const updateDisplayed = (u: uPlot | null, activeIds: string[], activeParams: string[]) => {
  if (!u) return
  u.series.slice(1).forEach((s, i) => {
    const x = s as NamedSeries
    const [id, param] = splitTraceName(x.name)
    x.show = activeIds.includes(id) && activeParams.includes(param)

    const legendIndex = i + 1
    const legendItem = u.root.querySelectorAll('.u-series')[legendIndex]
    if (x.show) {
      legendItem.classList.remove('qcp-hidden')
    } else {
      legendItem.classList.add('qcp-hidden')
      legendItem.classList.remove('u-off')
    }
  })
  u.redraw()
}

/**
 * If a single ID is selected, will update to select the next in the list.
 */
export const nextId = (
  plot: uPlot | null,
  allIds: string[],
  activeIds: RefObject<string[]>,
  activeParams: RefObject<string[]>
) => {
  if (activeIds.current.length === 1) {
    const currentIndex = allIds.indexOf(activeIds.current[0])
    const newIndex = currentIndex + 1 < allIds.length ? currentIndex + 1 : 0
    activeIds.current = [allIds[newIndex]]
    document.querySelectorAll('.qcp-id-check').forEach((x, i) => {
      const el = x as HTMLInputElement
      el.checked = i === newIndex
    })
    updateDisplayed(plot, activeIds.current, activeParams.current)
  }
}

/**
 * If a single parameter is selected, will update to select the next in the list.
 */
export const nextParam = (
  plot: uPlot | null,
  allParams: string[],
  activeIds: RefObject<string[]>,
  activeParams: RefObject<string[]>
) => {
  if (activeParams.current.length === 1) {
    const currentIndex = allParams.indexOf(activeParams.current[0])
    const newIndex = currentIndex + 1 < allParams.length ? currentIndex + 1 : 0
    activeParams.current = [allParams[newIndex]]
    document.querySelectorAll('.qcp-param-check').forEach((x, i) => {
      const el = x as HTMLInputElement
      el.checked = i === newIndex
    })
    updateDisplayed(plot, activeIds.current, activeParams.current)
  }
}
