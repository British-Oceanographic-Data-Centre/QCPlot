import { useState } from 'react'

import { ChartContext } from './ChartContext'
import { ChartInner } from './components/ChartInner'
import { FLAGS, FlagSets } from './constants'
import type { ChartProps } from './types'

import './style.css'
import 'uplot/dist/uPlot.min.css'

/**
 * The main component exposed from this library. Wraps ChartInner in a context provider and passes props through.
 *
 * Note that this component assumes the x values of the data to be sorted, behaviour may be incorrect otherwise.
 */
export const Chart = ({ data, flaggedPoints, defaultShowAll, ...props }: ChartProps) => {
  const allIds = new Set(data.series.map(x => x.id))
  const allParams = new Set(data.series.map(x => x.parameter))

  const [activeIds, setActiveIds] = useState<string[]>(defaultShowAll ? [...allIds] : [])
  const initialActiveParams = (defaultShowAll || props.hideParameterSelect) ? [...allParams] : []
  const [activeParams, setActiveParams] = useState<string[]>(initialActiveParams)
  const contextFlagset = props.flagset && props.flagset in FLAGS ? props.flagset : FlagSets.ALPHABETICAL_FLAGS

  return (
    <ChartContext.Provider
      value={{
        flagCallback: props.flagCallback,
        activeIds,
        setActiveIds,
        activeParams,
        setActiveParams,
        totalSeriesCount: allIds.size * allParams.size,
        flagset: contextFlagset
      }}
    >
      <ChartInner {...props} data={data} flaggedPoints={flaggedPoints} />
    </ChartContext.Provider>
  )
}
