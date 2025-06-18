import type uPlot from 'uplot'

import { Data, FlaggedPoint, ISelectedPoints, NamedSeries } from './types'
import { isNil } from './utils'

export const getPointsForSelection = (u: uPlot) => {
  const lft = u.select.left
  const rgt = u.select.width + lft
  const top = u.select.top
  const bottom = u.select.height + top

  const leftIdx = u.posToIdx(lft)
  const rightIdx = u.posToIdx(rgt)
  const topVal = u.posToVal(top, 'y')
  const bottomVal = u.posToVal(bottom, 'y')

  const selectedPoints: ISelectedPoints = {}
  u.data.slice(1).forEach((x, seriesIndex) => {
    const seriesName = (u.series[seriesIndex + 1] as NamedSeries).name
    selectedPoints[seriesName] = []
    for (let i = leftIdx; i <= rightIdx; i++) {
      const xPos = u.valToPos(u.data[0][i], 'x')
      if (xPos < lft || xPos > rgt) continue
      const val = x[i]
      if (isNil(val)) continue
      if (val >= bottomVal && val <= topVal) {
        selectedPoints[seriesName].push(i)
      }
    }
  })
  return selectedPoints
}

interface updateFlagsProps {
  selectedPoints: ISelectedPoints,
  flag: string | null,
  existingFlags: FlaggedPoint[],
  data: Data,
  flagCallback?: (flaggedPoints: FlaggedPoint[]) => void
}

export const updateFlags = ({ selectedPoints, flag, existingFlags, data, flagCallback }: updateFlagsProps) => {
  const modifiedTraceNames = Object.entries(selectedPoints)
    .filter(([_, v]) => v.length > 0) // Filter to keys with at least one point
    .map(([k, _]) => k)

  const untouchedFlags = existingFlags.filter(x => !modifiedTraceNames.includes(x.traceName))
  const modifiedTraceFlags = existingFlags.filter(x => modifiedTraceNames.includes(x.traceName))
  let updatedFlags: FlaggedPoint[] = splitRanges(modifiedTraceFlags)

  // Remove selected points from the current flag list
  Object.keys(selectedPoints).forEach(traceName => {
    updatedFlags = updatedFlags.filter(x =>
      !(x.traceName === traceName && selectedPoints[traceName].includes(x.pointIndex))
    )
  })

  // Add newly flagged points to the list
  if (flag) {
    Object.keys(selectedPoints).forEach(traceName => {
      selectedPoints[traceName].forEach(pointIndex => {
        updatedFlags.push({
          traceName,
          pointIndex,
          flag
        })
      })
    })
  }
  if (flagCallback) {
    flagCallback(untouchedFlags.concat(combineRanges(updatedFlags)))
  }
}

export const getPointRanges = (points: number[]) => {
  const groups: number[][] = []
  let currentGroup: number[] = []
  points.sort((a, b) => a - b).forEach(point => {
    if (currentGroup.length === 0) {
      currentGroup.push(point)
    } else if (point === currentGroup[currentGroup.length - 1] + 1) {
      currentGroup.push(point)
    } else {
      groups.push(currentGroup)
      currentGroup = [point]
    }
  })
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  return groups.map(group => ({
    start: group[0],
    end: group[group.length - 1]
  }))
}

export const splitRanges = (flaggedPoints: FlaggedPoint[]) => {
  const splitFlags: FlaggedPoint[] = []
  flaggedPoints.forEach(flagObj => {
    if (isNil(flagObj.endIndex)) {
      splitFlags.push(flagObj)
    } else {
      for (let i = flagObj.pointIndex; i <= flagObj.endIndex; i++) {
        splitFlags.push({
          ...flagObj,
          pointIndex: i,
          endIndex: undefined
        })
      }
    }
  })
  return splitFlags
}

export const combineRanges = (flaggedPoints: FlaggedPoint[]) => {
  const combined: FlaggedPoint[] = []

  const keyedBySeriesName: {[key: string]: FlaggedPoint[]} = {}
  flaggedPoints.forEach(flag => {
    if (!keyedBySeriesName[flag.traceName]) {
      keyedBySeriesName[flag.traceName] = []
    }
    keyedBySeriesName[flag.traceName].push(flag)
  })

  Object.values(keyedBySeriesName).forEach(seriesFlags => {
    const keyed: {[key: string]: FlaggedPoint[]} = {}
    seriesFlags.forEach(flag => {
      if (!keyed[flag.flag]) {
        keyed[flag.flag] = []
      }
      keyed[flag.flag].push(flag)
    })
    Object.values(keyed).forEach(flags => {
      const indices = new Set<number>()
      flags.forEach(x => indices.add(x.pointIndex))
      const ranges = getPointRanges(Array.from(indices))
      ranges.forEach(idxRange => {
        combined.push({
          traceName: flags[0].traceName,
          pointIndex: idxRange.start,
          endIndex: idxRange.end,
          flag: flags[0].flag
        })
      })
    })
  })

  return combined
}
