import { RefObject } from 'react'

import type uPlot from 'uplot'

import { ConstantLine, NamedSeries } from './types'
import { isNil, splitTraceName, wrapIndex } from './utils'

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
  activeParams: RefObject<string[]>,
  direction = 1
) => {
  if (activeIds.current.length <= 1) {
    const currentIndex = allIds.indexOf(activeIds.current[0])
    const newIndex = wrapIndex(currentIndex + direction, allIds.length)
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
  activeParams: RefObject<string[]>,
  direction = 1
) => {
  if (activeParams.current.length <= 1) {
    const currentIndex = allParams.indexOf(activeParams.current[0])
    const newIndex = wrapIndex(currentIndex + direction, allParams.length)
    activeParams.current = [allParams[newIndex]]
    document.querySelectorAll('.qcp-param-check').forEach((x, i) => {
      const el = x as HTMLInputElement
      el.checked = i === newIndex
    })
    updateDisplayed(plot, activeIds.current, activeParams.current)
  }
}

/**
 * Draws constant-value lines onto the plot.
 */
export const drawConstantLines = (u: uPlot, lines: ConstantLine[]) => {
  const isVertical = u.scales.x.ori === 1
  const lineColour = '#000'
  const ctx = u.ctx
  ctx.save()

  let xVar = 'x'
  let yVar = 'y'
  let xRange = [u.scales.x.min!, u.scales.x.max!]
  let yRange = [u.scales.y.min!, u.scales.y.max!]
  if (isVertical) {
    [xRange, yRange] = [yRange, xRange]
    xVar = 'y'
    yVar = 'x'
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let x0, y0, x1, y1
    if (line.y !== undefined) {
      x0 = u.valToPos(xRange[0], xVar, true)
      y0 = u.valToPos(line.y, yVar, true)
      x1 = u.valToPos(xRange[1], xVar, true)
      y1 = u.valToPos(line.y, yVar, true)
    } else if (line.x !== undefined) {
      x0 = u.valToPos(line.x, xVar, true)
      y0 = u.valToPos(yRange[0], yVar, true)
      x1 = u.valToPos(line.x, xVar, true)
      y1 = u.valToPos(yRange[1], yVar, true)
    } else {
      continue
    }

    ctx.beginPath()
    ctx.strokeStyle = lineColour
    ctx.setLineDash([5, 5])
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.setLineDash([])
    const fontSizeEm = 0.8
    ctx.font = `${fontSizeEm * window.devicePixelRatio}em Arial`
    ctx.fillStyle = lineColour
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(line.label, x0 + 2, y0, 1000)
  }

  ctx.restore()
}
