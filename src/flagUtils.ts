import type uPlot from 'uplot'

import { FlaggedPoint, SelectedPoints, NamedSeries } from './types'
import { isNil, unique } from './utils'

/**
 * Clear current selected region on the plot.
 */
export const clearSelection = (u: uPlot | null) => {
  if (u) {
    u.setSelect({ left: 0, top: 0, width: 0, height: 0 })
    u.root.querySelector('.u-select')?.classList.remove('qcp-flag-select')
  }
}

/**
 * Get the points within the currently selected region.
 */
export const getPointsForSelection = (u: uPlot): SelectedPoints => {
  const isVertical = u.scales.x.ori === 1

  const lft = u.select.left
  const rgt = u.select.width + lft
  const top = u.select.top
  const bottom = u.select.height + top

  const selectedPoints: SelectedPoints = {}

  const xStartIndex = u.posToIdx(isVertical ? top : lft)
  const xEndIndex = u.posToIdx(isVertical ? bottom : rgt)
  const upperYVal = u.posToVal(isVertical ? rgt : top, 'y')
  const lowerYVal = u.posToVal(isVertical ? lft : bottom, 'y')

  u.data.slice(1).forEach((x, seriesIndex) => {
    const seriesName = (u.series[seriesIndex + 1] as NamedSeries).name
    selectedPoints[seriesName] = []
    for (let i = xStartIndex; i <= xEndIndex; i++) {
      const xPos = u.valToPos(u.data[0][i], 'x')
      if (
        (isVertical && (xPos < top || xPos > bottom)) ||
        (!isVertical && (xPos < lft || xPos > rgt))
      ) {
        continue
      }
      const val = x[i]
      if (!isNil(val) && val >= lowerYVal && val <= upperYVal) {
        selectedPoints[seriesName].push(u.data[0][i])
      }
    }
  })
  return selectedPoints
}

interface updateFlagsProps {
  selectedPoints: SelectedPoints,
  flag: string | null,
  existingFlags: FlaggedPoint[],
  flagCallback?: (flaggedPoints: FlaggedPoint[]) => void
}

/**
 * Applies changes to the flagged points, passing the updated array to a callback method if provided.
 */
export const updateFlags = ({ selectedPoints, flag, existingFlags, flagCallback }: updateFlagsProps) => {
  const modifiedTraceNames = Object.entries(selectedPoints)
    .filter(([_, v]) => v.length > 0) // Filter to keys with at least one point
    .map(([k, _]) => k)

  const untouchedFlags = existingFlags.filter(x => !modifiedTraceNames.includes(x.traceName))
  const modifiedTraceFlags = existingFlags.filter(x => modifiedTraceNames.includes(x.traceName))
  const updatedFlags = cleanFlaggedPoints(modifiedTraceFlags)

  Object.keys(selectedPoints).forEach(traceName => {
    const traceFlaggedPoints = updatedFlags.filter(x => x.traceName === traceName)
    traceFlaggedPoints.forEach(f => {
      f.xValues = f.xValues.filter(x => !selectedPoints[traceName].includes(x))
    })
  })

  if (flag) {
    Object.keys(selectedPoints).forEach(traceName => {
      const matchingFP = updatedFlags.find(f => f.traceName === traceName && f.flag === flag)
      if (matchingFP) {
        matchingFP.xValues = unique(matchingFP.xValues.concat(selectedPoints[traceName])) as number[]
      } else if (selectedPoints[traceName].length > 0) {
        updatedFlags.push({
          traceName,
          xValues: selectedPoints[traceName],
          flag
        })
      }
    })
  }

  if (flagCallback) {
    flagCallback(untouchedFlags.concat(cleanFlaggedPoints(updatedFlags)))
  }
}

/**
 * Takes an array of numbers and combine into grouped ranges.
 * @example e.g. [1,2,4] would return [{start: 1, end: 2}, {start: 4, end: 4}]
 */
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

/**
 * Takes an array of flagged data and split point ranges into individual points.
 * Opposite of combineRanges.
 */
// export const splitRanges = (flaggedPoints: FlaggedPoint[]) => {
//   const splitFlags: FlaggedPoint[] = []
//   flaggedPoints.forEach(flagObj => {
//     if (isNil(flagObj.endIndex)) {
//       splitFlags.push(flagObj)
//     } else {
//       for (let i = flagObj.pointIndex; i <= flagObj.endIndex; i++) {
//         splitFlags.push({
//           ...flagObj,
//           pointIndex: i,
//           endIndex: undefined
//         })
//       }
//     }
//   })
//   return splitFlags
// }

/**
 * Takes an array of flagged data and combine individual points into point ranges.
 * Opposite of splitRanges.
 */
// export const combineRanges = (flaggedPoints: FlaggedPoint[]) => {
//   const combined: FlaggedPoint[] = []

//   const keyedBySeriesName: {[key: string]: FlaggedPoint[]} = {}
//   flaggedPoints.forEach(flag => {
//     if (!keyedBySeriesName[flag.traceName]) {
//       keyedBySeriesName[flag.traceName] = []
//     }
//     keyedBySeriesName[flag.traceName].push(flag)
//   })

//   Object.values(keyedBySeriesName).forEach(seriesFlags => {
//     const keyed: {[key: string]: FlaggedPoint[]} = {}
//     seriesFlags.forEach(flag => {
//       if (!keyed[flag.flag]) {
//         keyed[flag.flag] = []
//       }
//       keyed[flag.flag].push(flag)
//     })
//     Object.values(keyed).forEach(flags => {
//       const indices = new Set<number>()
//       flags.forEach(x => indices.add(x.pointIndex))
//       const ranges = getPointRanges(Array.from(indices))
//       ranges.forEach(idxRange => {
//         combined.push({
//           traceName: flags[0].traceName,
//           pointIndex: idxRange.start,
//           endIndex: idxRange.end,
//           flag: flags[0].flag
//         })
//       })
//     })
//   })

//   return combined
// }

/**
 *  Removes FlaggedPoints with duplicate traceName + flag (if they exist)
 */
export const cleanFlaggedPoints = (flaggedPoints: FlaggedPoint[]): FlaggedPoint[] => {
  const combined: {[key: string]: FlaggedPoint} = {}
  flaggedPoints.forEach(fp => {
    const key = `${fp.traceName};${fp.flag}`
    if (key in combined) {
      combined[key].xValues = unique(combined[key].xValues.concat(fp.xValues)) as number[]
    } else {
      combined[key] = fp
    }
  })

  return Object.values(combined).filter(x => x.xValues.length > 0)
}

/**
 * Combines the flaggedPoints and originatorFlaggedPoints to a single effective array.
 */
export const combineFlaggedPoints = (
  flaggedPoints: FlaggedPoint[], originatorFlaggedPoints: FlaggedPoint[]
): FlaggedPoint[] => {
  if (originatorFlaggedPoints.length === 0) {
    return flaggedPoints
  }
  const splitFlaggedPoints = splitRanges(flaggedPoints)
  const splitOriginatorFlaggedPoints = splitRanges(originatorFlaggedPoints)

  const combinedFpKeyed: {[key: string]: FlaggedPoint} = {}
  splitOriginatorFlaggedPoints.forEach(fp => {
    combinedFpKeyed[`${fp.traceName}-${fp.pointIndex}`] = fp
  })
  // Overwrite originator flag if same index
  splitFlaggedPoints.forEach(fp => {
    combinedFpKeyed[`${fp.traceName}-${fp.pointIndex}`] = fp
  })

  return combineRanges(Object.values(combinedFpKeyed))
}
