import uPlot from 'uplot'

import { Data, DataSeries, FlaggedPoint, NamedSeries } from './types'

export const isNil = (val: unknown) => {
  return val === undefined || val === null
}

export const invertHex = (hex: string) => {
  return '#' + (Number(`0x1${hex.replace('#', '')}`) ^ 0xFFFFFF).toString(16).substring(1).toUpperCase()
}

export const getTraceName = (series: DataSeries) => {
  return `${series.id}-${series.parameter}`
}

export const getSeriesLabel = (series: DataSeries) => {
  return `${series.formattedId || series.id}-${series.parameter}`
}

export const getFlagForPoint = (flaggedPoints: FlaggedPoint[], pointIndex: number) => {
  for (let i = 0; i < flaggedPoints.length; i++) {
    const thisFlag = flaggedPoints[i]
    if (thisFlag.endIndex === undefined) {
      if (thisFlag.pointIndex === pointIndex) return thisFlag.flag
    } else if (pointIndex >= thisFlag.pointIndex && pointIndex <= thisFlag.endIndex) {
      return thisFlag.flag
    }
  }
}

export const seriesFromData = (
  data: Data,
  flaggedPoints: FlaggedPoint[],
  colours: string[],
  activeIds: string[],
  activeParams: string[]
) => {
  const seriesArray = [{}]

  const applyFlag = (u: uPlot, value: number | null, seriesIdx: number, pointIndex: number) => {
    if (value === null) return null

    const traceName = (u.series[seriesIdx] as NamedSeries).name
    const seriesFlags = flaggedPoints.filter(x => x.traceName === traceName)
    const flag = getFlagForPoint(seriesFlags, pointIndex)
    if (flag) {
      return `${value} (${flag})`
    }
    return value
  }

  data.series.forEach((series, i) => {
    if (activeIds.includes(series.id) && activeParams.includes(series.parameter)) {
      seriesArray.push({
        name: `${series.id}-${series.parameter}`,
        label: `${series.formattedId || series.id}-${series.parameter}`,
        scale: 'y',
        value: (u: uPlot, v: number, seriesIdx: number, pointIndex: number) => applyFlag(u, v, seriesIdx, pointIndex),
        stroke: colours[i % colours.length]
      })
    }
  })

  return seriesArray
}

export const getArrayMinMax = (arr: number[]) => {
  let min = Infinity
  let max = -Infinity
  arr.forEach(x => {
    if (x < min) min = x
    if (x > max) max = x
  })
  return { min, max }
}
