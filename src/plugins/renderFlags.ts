import uPlot, { Options } from 'uplot'

import { FlaggedPoint, NamedSeries } from '../types'
import { getFlagForPoint, isNil } from '../utils'
import { PointDisplay } from '@/constants'

const POINT_THRESHOLD = 10_000
const linear = uPlot.paths.linear!()

/**
 * uPlot plugin to render symbols for flagged data.
 * @param flaggedPoints Array of the flagged points.
 * @param showPoints Current point display mode.
 */
export const renderFlagsPlugin = (
  flaggedPoints: FlaggedPoint[] = [],
  showPoints: number,
  scatterMode = false
): uPlot.Plugin => {
  const drawFlagMarker = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    let shapeSize = 6
    shapeSize *= window.devicePixelRatio

    ctx.beginPath()

    ctx.moveTo(cx - shapeSize, cy - shapeSize)
    ctx.lineTo(cx + shapeSize, cy + shapeSize)
    ctx.moveTo(cx - shapeSize, cy + shapeSize)
    ctx.lineTo(cx + shapeSize, cy - shapeSize)

    ctx.closePath()
    ctx.stroke()
  }

  const drawFlaggedPoints = (u: uPlot, i: number, i0: number, i1: number) => {
    const isVertical = u.scales.x.ori === 1

    const thisSeries = u.series[i]
    const visiblePoints = thisSeries.idxs![1] - thisSeries.idxs![0]
    // If return is true then all points are rendered - breaks if too many!
    // Do this check at the top as rendering flagged points with too many on screen also caused problems
    if (visiblePoints >= POINT_THRESHOLD) return false

    if (showPoints !== PointDisplay.HIDE_FLAGS) {
      const { ctx } = u

      ctx.save()

      ctx.strokeStyle = (thisSeries as uPlot.Series & {_stroke: string})._stroke
      ctx.lineWidth = 3

      const data: number[] = []
      const xVals: number[] = []
      let nullCountToLeft = 0 // count nulls in this series to the left of the visible range
      // Remove null padding to ensure flags align correctly with data
      u.data[i].forEach((x, indx) => {
        if (!isNil(x)) {
          data.push(x)
          xVals.push(u.data[0][indx])
        } else if (indx < i0) {
          nullCountToLeft += 1
        }
      })

      let j = i0 - nullCountToLeft // offset to ensure we loop over the correct points

      const seriesFlags = flaggedPoints.filter(x => x.traceName === (thisSeries as NamedSeries).name)
      while (j <= i1) {
        // Render symbol if point is flagged OR if we're displaying flagged points only
        // The FLAGS_ONLY check is a slight cheat to get round the flag indices being offset when data is filtered out
        if (showPoints === PointDisplay.FLAGS_ONLY || getFlagForPoint(seriesFlags, j)) {
          const val = data[j]

          if (val >= u.scales.y.min! && val <= u.scales.y.max!) {
            let cx = Math.round(u.valToPos(xVals[j], 'x', true))
            let cy = Math.round(u.valToPos(val!, 'y', true))
            const pointSizeOffset = thisSeries.points?.size ? (thisSeries.points?.size / 5) - 1 : 0
            cx += pointSizeOffset * devicePixelRatio
            cy += pointSizeOffset * devicePixelRatio

            if (isVertical) {
              drawFlagMarker(ctx, cy, cx)
            } else {
              drawFlagMarker(ctx, cx, cy)
            }
          }
        }
        j++
      }

      ctx.restore()
    }

    return visiblePoints <= 10_000
  }

  const showPaths = (u: uPlot, si: number, io: number, i1: number) => {
    const series = u.series[si]
    if (!series.idxs) return linear(u, si, io, i1)
    const visiblePoints = series.idxs[1] - series.idxs[0]
    if (visiblePoints >= POINT_THRESHOLD || !scatterMode) {
      return linear(u, si, io, i1)
    } else {
      return null
    }
  }

  const plugin: uPlot.Plugin = {
    opts: (u: uPlot, opts: Options) => {
      opts.series.forEach((s, i) => {
        if (i > 0) {
          uPlot.assign(s, {
            points: {
              show: drawFlaggedPoints
            },
            paths: showPaths
          })
        }
      })
    },
    hooks: {}
  }
  return plugin
}
