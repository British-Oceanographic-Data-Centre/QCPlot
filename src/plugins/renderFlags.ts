import uPlot, { Options } from 'uplot'

import { FlaggedPoint, NamedSeries } from '../types'
import { getFlagForPoint } from '../utils'

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
      // ctx.strokeStyle = invertHex(_stroke)

      let j = i0

      const seriesFlags = flaggedPoints.filter(x => x.traceName === (thisSeries as NamedSeries).name)
      while (j <= i1) {
        if (getFlagForPoint(seriesFlags, j)) {
          const val = u.data[i][j]!
          if (val >= u.scales.y.min! && val <= u.scales.y.max!) {
            const cx = Math.round(u.valToPos(u.data[0][j], 'x', true))
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
