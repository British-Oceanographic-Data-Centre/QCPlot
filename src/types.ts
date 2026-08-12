import type React from 'react'

import type { Series } from 'uplot'

import { FLAGS } from './constants'

export interface FlaggedPoint {
  traceName: string
  pointIndex: number
  endIndex?: number // endIndex is inclusive
  flag: string
  isOriginatorFlag?: boolean
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

export interface ConstantLine {
  x?: number
  y?: number
  label: string
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
  goodFlags? : string[] // List of flags that should shouldn't display as different symbols on the plots
  idLabel?: string
  constantLines?: ConstantLine[]
}

export interface ChartContextValue {
  flagCallback?: (flaggedPoints: FlaggedPoint[]) => void
  allIds: string[]
  allParams: string[]
  activeIds: React.RefObject<string[]>
  activeParams: React.RefObject<string[]>
  totalSeriesCount: number
  flagset?: keyof typeof FLAGS
  idLabel?: string
}

export interface SelectedPoints {
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
