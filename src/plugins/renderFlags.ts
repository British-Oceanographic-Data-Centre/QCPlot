import uPlot, { Options } from 'uplot'

import { FlaggedPoint, NamedSeries } from '../types'
import { getFlagForPoint, isNil } from '../utils'

/**
 * uPlot plugin to render symbols for flagged data.
 * @param flaggedPoints Array of the flagged points.
 * @param showFlags Whether or not flags should be displayed.
 */
export const renderFlagsPlugin = (flaggedPoints: FlaggedPoint[] = [], showFlags: boolean): uPlot.Plugin => {
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
    const thisSeries = u.series[i]
    const visiblePoints = thisSeries.idxs![1] - thisSeries.idxs![0]
    // If return is true then all points are rendered - breaks if too many!
    // Do this check at the top as rendering flagged points with too many on screen also caused problems
    if (visiblePoints >= 10_000) return false

    if (showFlags) {
      const { ctx } = u
      // const { _stroke, scale } = u.series[i];
      const { scale } = u.series[i]

      ctx.save()

      // ctx.fillStyle = _stroke;
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
        if (getFlagForPoint(seriesFlags, j)) {
          const val = data[j]

          if (val >= u.scales.y.min! && val <= u.scales.y.max!) {
            const cx = Math.round(u.valToPos(xVals[j], 'x', true))
            const cy = Math.round(u.valToPos(val!, scale!, true))
            drawFlagMarker(ctx, cx, cy)
          }
        }
        j++
      }

      ctx.restore()
    }

    return visiblePoints <= 10_000
  }

  const plugin: uPlot.Plugin = {
    opts: (u: uPlot, opts: Options) => {
      opts.series.forEach((s, i) => {
        if (i > 0) {
          uPlot.assign(s, {
            points: {
              show: drawFlaggedPoints
            }
          })
        }
      })
    },
    hooks: {}
  }
  return plugin
}
