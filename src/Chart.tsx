import { useRef } from 'react'

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
export const Chart = ({ data, flaggedPoints, defaultShowAll, idLabel, sharedFlagGroups, ...props }: ChartProps) => {
  const allIds = new Set(data.series.map(x => x.id))
  const allParams = new Set(data.series.map(x => x.parameter))

  const initialActiveIds = defaultShowAll ? [...allIds] : []
  const initialActiveParams = (defaultShowAll || props.hideParameterSelect) ? [...allParams] : []
  const contextFlagset = props.flagset && props.flagset in FLAGS ? props.flagset : FlagSets.ALPHABETICAL_FLAGS

  const activeIds = useRef<string[]>(initialActiveIds)
  const activeParams = useRef<string[]>(initialActiveParams)

  // Update sharedFlagGroups from 2D array to an object, to allow faster lookups by key
  const sharedFlagGroupsKeyed: {[key: string]: string[]} = {}
  sharedFlagGroups?.forEach(a => {
    a.forEach(b => { sharedFlagGroupsKeyed[b] = a.filter(i => i !== b) })
  })

  return (
    <ChartContext.Provider
      value={{
        flagCallback: props.flagCallback,
        allIds: Array.from(allIds),
        allParams: Array.from(allParams),
        activeIds,
        activeParams,
        totalSeriesCount: allIds.size * allParams.size,
        flagset: contextFlagset,
        idLabel: idLabel || 'OID'
      }}
    >
      <ChartInner {...props} data={data} flaggedPoints={flaggedPoints} sharedFlagGroupsKeyed={sharedFlagGroupsKeyed} />
    </ChartContext.Provider>
  )
}
