import uPlot from 'uplot'

import { Data, DataSeries, FlaggedPoint, NamedSeries } from './types'

/**
 * Checks if value is null or undefined.
 * @param val a value of unknown type
 * @returns true if val is null or undefined, else false
 */
export const isNil = (val: unknown) => {
  return val === undefined || val === null
}

/**
 * Constructs the trace name for a given series.
 */
export const getTraceName = (series: DataSeries) => {
  return `${series.id}-${series.parameter}`
}

/**
 * Constructs the displayed label for a given series.
 */
export const getSeriesLabel = (series: DataSeries) => {
  return `${series.formattedId || series.id}-${series.parameter}`
}

/**
 * Gets the flag at a specific index from an array of FlaggedPoints
 */
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

/**
 * Constructs an array of series objects to be passed to uPlot from raw input data.
 * @param data The original data passed to the Chart component.
 * @param flaggedPoints Accompanying array of flags.
 * @param colours Array of hex-string colours to be used.
 * @param activeIds Array of the IDs in the data that are visible.
 * @param activeParams Array of the parameters in the data that are visible.
 * @param showCycleNumber Whether to show the cycle number in the legend.
 */
export const seriesFromData = (
  data: Data,
  flaggedPoints: FlaggedPoint[],
  colours: string[],
  activeIds: string[],
  activeParams: string[],
  showCycleNumber = false,
  scatterMode = false
) => {
  const seriesArray: (uPlot.Series | NamedSeries)[] = [{}]

  const formatLabel = (u: uPlot, value: number | null, seriesIdx: number, pointIndex: number | null) => {
    if (value === null || pointIndex === null) {
      return showCycleNumber ? 'Val: -- Cyc: --' : 'Val: --'
    }

    // Count nulls in the series before this, to offset correctly
    const precedingNulls = (u.data[seriesIdx] as (number | null)[]).filter((v, j) => v === null && j < pointIndex)

    const traceName = (u.series[seriesIdx] as NamedSeries).name
    const seriesFlags = flaggedPoints.filter(x => x.traceName === traceName)
    const flag = getFlagForPoint(seriesFlags, pointIndex - precedingNulls.length)

    let label: string
    if (showCycleNumber) {
      label = `Val: ${value} Cyc: ${pointIndex - precedingNulls.length}`
    } else {
      label = value.toString()
    }
    if (flag) {
      label += ` (${flag})`
    }
    return label
  }

  data.series.forEach((series, i) => {
    if (activeIds.includes(series.id) && activeParams.includes(series.parameter)) {
      seriesArray.push({
        name: getTraceName(series),
        label: getSeriesLabel(series),
        scale: 'y',
        value: formatLabel,
        stroke: colours[i],
        paths: scatterMode ? u => null : undefined,
        points: scatterMode ? { size: 7, fill: colours[i] } : undefined,
        spanGaps: series.spanGaps
      })
    }
  })

  return seriesArray
}

/**
 * Get the min and max values form an array of numbers.
 * @param arr Input array
 */
export const getArrayMinMax = (arr: number[]) => {
  let min = Infinity
  let max = -Infinity
  arr.forEach(x => {
    if (x < min) min = x
    if (x > max) max = x
  })
  return { min, max }
}

/**
 * Duplicates elements in an array to create a larger array of particular size.
 * @param arr The original array being extended.
 * @param desiredLength The required length of the returned array.
 */
export const extendArray = (arr: any[], desiredLength: number) => {
  const output = []
  for (let i = 0; i < desiredLength; i++) {
    output.push(arr[i % arr.length])
  }

  return output
}

/**
 * Maps the index from a null-less array to the actual index when null padding is included.
 * @param arr The array to be checked.
 */
export const nullPaddedIndexMap = (arr: any[]) => {
  const result: {[index: number]: number} = {}
  let runningTotal = 0
  let nonNullIndex = 0
  arr.forEach((x, i) => {
    if (isNil(x)) {
      runningTotal += 1
    } else {
      result[nonNullIndex] = runningTotal
      nonNullIndex += 1
    }
  })
  return result
}
