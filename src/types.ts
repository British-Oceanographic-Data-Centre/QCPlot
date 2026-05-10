import type React from 'react'

import type { Series } from 'uplot'

import { FLAGS } from './constants'

export interface FlaggedPoint {
  traceName: string
  pointIndex: number
  endIndex?: number // endIndex is inclusive
  flag: string
}

export interface DataSeries {
  id: string
  formattedId?: string
  parameter: string
  values: (number | null)[]
  spanGaps?: boolean
}

export interface Data {
  xValues: (number | string)[]
  series: DataSeries[]
}

export interface ChartProps {
  data: Data
  enableFlagging: boolean
  flaggedPoints?: FlaggedPoint[]
  // Originator flags have slightly different properties:
  // They can be overwritten by manually flagging the point but they can't be removed
  originatorFlaggedPoints?: FlaggedPoint[]
  plotColours?: string[]
  flagCallback?: (flaggedPoints: FlaggedPoint[]) => void
  xTimeAxis?: boolean
  defaultShowAll?: boolean
  height?: number // in px
  showCycleNumber?: boolean
  verticalMode?: boolean
  scatterMode?: boolean
  hideParameterSelect?: boolean
  flagset?: keyof typeof FLAGS
  xAxisLabel?: string
  yAxisLabel?: string
}

export interface ChartContextValue {
  flagCallback?: (flaggedPoints: FlaggedPoint[]) => void
  activeIds: string[]
  setActiveIds: React.Dispatch<React.SetStateAction<string[]>>
  activeParams: string[]
  setActiveParams: React.Dispatch<React.SetStateAction<string[]>>
  totalSeriesCount: number
  flagset?: keyof typeof FLAGS
}

export interface ISelectedPoints {
  [traceName: string]: number[] // array of point indices
}

export interface NamedSeries extends Series {
  name: string
}

export interface InitialRange {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}
