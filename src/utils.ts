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
 * Adjusts an integer to fit within the index bounds of an array.
 * If index exceeds the end it will wrap around to the start, likewise at the other end.
 */
export const wrapIndex = (index: number, arrayLength: number) => {
  console.log(index, arrayLength)
  if (index >= arrayLength) {
    return 0
  } if (index < 0) {
    return arrayLength - 1
  }
  return index
}

/**
 * Constructs the trace name for a given series.
 */
export const getTraceName = (series: DataSeries) => {
  return `${series.id}-${series.parameter}`
}

/**
 * Splits a trace name into ID and param. Opposite of getTraceName.
 */
export const splitTraceName = (name: string): string[] => {
  // Assume the parameter doesn't contain a hyphen, but the ID could
  const parts = name.split('-')
  const param = parts.pop() as string
  const id = parts.join('/')
  return [id, param]
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
    const baseLabel = scatterMode ? 'x: -- y: --' : '--'
    if (value === null || pointIndex === null) {
      return showCycleNumber ? `${baseLabel} Cyc: --` : baseLabel
    }

    // Count nulls in the series before this, to offset correctly
    const precedingNulls = (u.data[seriesIdx] as (number | null)[]).filter((v, j) => v === null && j < pointIndex)

    const traceName = (u.series[seriesIdx] as NamedSeries).name
    const seriesFlags = flaggedPoints.filter(x => x.traceName === traceName)
    const flag = getFlagForPoint(seriesFlags, pointIndex - precedingNulls.length)

    let label: string
    if (scatterMode) {
      const x = u.data[0][pointIndex]
      const y = value
      const isVertical = u.scales.x.ori === 1
      label = isVertical ? `x: ${y} y: ${x}` : `x: ${x} y: ${y}`
    } else {
      label = `${value}`
    }
    if (showCycleNumber) {
      label += ` Cyc: ${pointIndex - precedingNulls.length + 1}`
    }
    if (flag) {
      label += ` (${flag})`
    }
    return label
  }

  data.series.forEach((series, i) => {
    seriesArray.push({
      name: getTraceName(series),
      label: getSeriesLabel(series),
      scale: 'y',
      value: formatLabel,
      stroke: colours[i],
      paths: scatterMode ? u => null : undefined,
      points: scatterMode ? { size: 7, fill: colours[i] } : undefined,
      spanGaps: series.spanGaps,
      show: activeIds.includes(series.id) && activeParams.includes(series.parameter)
    })
  })

  return seriesArray
}

/**
 * Get the min and max values from an array of numbers.
 * @param arr Input array
 */
export const getArrayMinMax = (arr: number[]) => {
  let min = Infinity
  let max = -Infinity
  arr.forEach(x => {
    if (!isNil(x)) {
      if (x < min) min = x
      if (x > max) max = x
    }
  })
  return { min, max }
}

/**
 * Duplicates elements in an array to create a larger array of particular size.
 * @param arr The original array being extended.
 * @param desiredLength The required length of the returned array.
 */
export const extendArray = (arr: string[], desiredLength: number) => {
  const output = []
  for (let i = 0; i < desiredLength; i++) {
    output.push(arr[i % arr.length])
  }

  return output
}

/**
 * Takes an array A and creates a mapping {x: y}. Take B to be the array formed of removing all null values from A,
 * then x is the index of B and y is the count of preceding null values removed from A.
 *
 * Since this library uses null-padding to align data to a consistent axis, this mapping is useful
 * to keep consistency between the original data and its null-padded counterpart.
 *
 * @param arr The array to be checked.
 */
export const nullPaddedIndexMap = (arr: (number | null)[]) => {
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

/**
 * Combines multiple plot data objects aligning the x values across them using null padding.
 *
 * @param allPlotData Array of Data objects to be combined
 * @param sortNumeric Boolean - whether to case X values to numbers before applying sort
 * @param uniqueXs Boolean - whether to allow duplicate X values in the combined data
 */
export const combinePlotData = (allPlotData: Data[], sortNumeric = false, uniqueXs = true) => {
  let allXValues: (string|number)[] = []
  if (uniqueXs) {
    const allXsSet = new Set<string|number>()
    allPlotData.forEach(d => {
      d.xValues.forEach(x => allXsSet.add(x))
    })
    allXValues = Array.from(allXsSet)
  } else {
    allPlotData.forEach(d => {
      d.xValues.forEach(x => allXValues.push(x))
    })
  }
  const allXs = sortNumeric ? allXValues.sort((a, b) => Number(a) - Number(b)) : allXValues.sort()

  const adjustedSeries: DataSeries[] = []
  allPlotData.forEach(d => {
    // Create a dictionary of x-values to index for quick lookup
    const indexedDatasetXs: {[key: string]: number[]} = {}
    d.xValues.forEach((x, i) => {
      if (!uniqueXs && indexedDatasetXs[x] !== undefined) {
        indexedDatasetXs[x].push(i)
      } else {
        indexedDatasetXs[x] = [i]
      }
    })
    d.series.forEach(s => {
      const adjusted: DataSeries = {
        ...s,
        spanGaps: true,
        values: []
      }
      let currentXCount = 0 // Used to track duplicate x values
      allXs.forEach((x, j) => {
        if (j > 0 && x === allXs[j - 1]) {
          currentXCount += 1
        } else {
          currentXCount = 0
        }
        const i = indexedDatasetXs[x] !== undefined ? indexedDatasetXs[x][currentXCount] : undefined
        if (i !== undefined) {
          // if this x value exists for this particular series
          adjusted.values.push(s.values[i])
        } else {
          // else null-pad it
          adjusted.values.push(null)
        }
      })
      adjustedSeries.push(adjusted)
    })
  })

  const data: Data = {
    xValues: allXs,
    series: adjustedSeries
  }
  return data
}
