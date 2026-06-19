import type uPlot from 'uplot'

import type { InitialRange } from '@/types'

/**
 * uPlot plugin to enable zooming with the mouse wheel.
 * @param initialScales Initial x/y ranges of the plot.
 */
export const scrollZoomPlugin = (initialScales: InitialRange | null): uPlot.Plugin => {
  const factor = 0.75

  let xMin: number
  let xMax: number
  let yMin: number
  let yMax: number
  let xRange: number
  let yRange: number

  const clamp = (nRange: number, nMin: number, nMax: number, fRange: number, fMin: number, fMax: number) => {
    if (nRange > fRange) {
      nMin = fMin
      nMax = fMax
    } else if (nMin < fMin) {
      nMin = fMin
      nMax = fMin + nRange
    } else if (nMax > fMax) {
      nMax = fMax
      nMin = fMax - nRange
    }

    return [nMin, nMax]
  }

  return {
    hooks: {
      ready: (u: uPlot) => {
        const isVertical = u.scales.x.ori === 1
        const horizontalScale = isVertical ? 'y' : 'x'
        const verticalScale = isVertical ? 'x' : 'y'

        if (initialScales) {
          xMin = isVertical ? initialScales.yMin : initialScales.xMin
          xMax = isVertical ? initialScales.yMax : initialScales.xMax
          yMin = isVertical ? initialScales.xMin : initialScales.yMin
          yMax = isVertical ? initialScales.xMax : initialScales.yMax
        } else {
          xMin = u.scales[horizontalScale].min!
          xMax = u.scales[horizontalScale].max!
          yMin = u.scales[verticalScale].min!
          yMax = u.scales[verticalScale].max!
        }

        xRange = xMax - xMin
        yRange = yMax - yMin

        const over = u.over
        const rect = over.getBoundingClientRect()

        // wheel drag pan
        over.addEventListener('mousedown', e => {
          if (e.button === 1) {
            // plot.style.cursor = "move";
            e.preventDefault()

            const left0 = e.clientX
            // let top0 = e.clientY;

            const scXMin0 = u.scales[horizontalScale].min!
            const scXMax0 = u.scales[horizontalScale].max!

            const xUnitsPerPx = u.posToVal(1, horizontalScale) - u.posToVal(0, horizontalScale)

            const onmove = (e: MouseEvent) => {
              e.preventDefault()

              const left1 = e.clientX
              // let top1 = e.clientY;

              const dx = xUnitsPerPx * (left1 - left0)

              u.setScale(horizontalScale, {
                min: scXMin0 - dx,
                max: scXMax0 - dx
              })
            }

            const onup = (e: MouseEvent) => {
              document.removeEventListener('mousemove', onmove)
              document.removeEventListener('mouseup', onup)
            }

            document.addEventListener('mousemove', onmove)
            document.addEventListener('mouseup', onup)
          }
        })

        // wheel scroll zoom
        over.addEventListener('wheel', e => {
          if (!e.ctrlKey) return // Only zoom if "ctrl" is held down
          e.preventDefault()

          const { left, top } = u.cursor

          const leftPct = left! / rect.width
          const btmPct = isVertical ? top! / rect.height : 1 - top! / rect.height

          const xVal = u.posToVal(left!, horizontalScale)
          const yVal = u.posToVal(top!, verticalScale)
          const oxRange = u.scales[horizontalScale].max! - u.scales[horizontalScale].min!
          const oyRange = u.scales[verticalScale].max! - u.scales[verticalScale].min!

          const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor
          let nxMin = xVal - leftPct * nxRange
          let nxMax = nxMin + nxRange;
          [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax)

          const nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor
          let nyMin = yVal - btmPct * nyRange
          let nyMax = nyMin + nyRange;
          [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax)

          u.batch(() => {
            u.setScale(horizontalScale, {
              min: nxMin,
              max: nxMax
            })

            u.setScale(verticalScale, {
              min: nyMin,
              max: nyMax
            })

            u.setSelect({ left: 0, top: 0, width: 0, height: 0 })
          })
        })
      }
    }
  }
}
