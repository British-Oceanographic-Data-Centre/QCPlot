import type uPlot from 'uplot'

import { Data, FlaggedPoint, ISelectedPoints } from './types'
import { getTraceName, isNil } from './utils'

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
    selectedPoints[seriesIndex + 1] = []
    for (let i = leftIdx; i <= rightIdx; i++) {
      const xPos = u.valToPos(u.data[0][i], 'x')
      if (xPos < lft || xPos > rgt) continue
      const val = x[i]
      if (isNil(val)) continue
      if (val >= bottomVal && val <= topVal) {
        selectedPoints[seriesIndex + 1].push(i)
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
  // TODO: Don't really want to split/combine on series that aren't being touched
  let updatedFlags: FlaggedPoint[] = splitRanges(existingFlags)

  // Remove selected points from the current flag list
  Object.keys(selectedPoints).forEach(idx => {
    const seriesIndex = Number(idx)
    const traceName = getTraceName(data.series[seriesIndex - 1])
    updatedFlags = updatedFlags.filter(x =>
      !(x.traceName === traceName && selectedPoints[seriesIndex].includes(x.pointIndex))
    )
  })

  // Add newly flagged points to the list
  if (flag) {
    Object.keys(selectedPoints).forEach(idx => {
      const seriesIndex = Number(idx)
      const traceName = getTraceName(data.series[seriesIndex - 1])
      selectedPoints[seriesIndex].forEach(pointIndex => {
        updatedFlags.push({
          traceName,
          pointIndex,
          flag
        })
      })
    })
  }
  if (flagCallback) {
    flagCallback(combineRanges(updatedFlags))
  }
}

export const getPointRanges = (points: number[]) => {
  const groups: number[][] = []
  let currentGroup: number[] = []
  points.sort().forEach(point => {
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
      const indices = flags.map(x => x.pointIndex)
      const ranges = getPointRanges(indices)
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
