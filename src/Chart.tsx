import { useState } from 'react'

import { ChartContext } from './ChartContext'
import { ChartInner } from './components/ChartInner'
import { DEFAULT_COLOURS } from './constants'
import type { ChartProps } from './types'

import './style.css'
import 'uplot/dist/uPlot.min.css'

export const Chart = ({ data, flaggedPoints, defaultShowAll, ...props }: ChartProps) => {
  const allIds = new Set(data.series.map(x => x.id))
  const allParams = new Set(data.series.map(x => x.parameter))

  const [activeIds, setActiveIds] = useState<string[]>(defaultShowAll ? [...allIds] : [])
  const [activeParams, setActiveParams] = useState<string[]>(defaultShowAll ? [...allParams] : [])

  return (
    <ChartContext.Provider
      value={{
        colours: props.plotColours || DEFAULT_COLOURS,
        buttonClassname: props.buttonClassname || '',
        flagCallback: props.flagCallback,
        activeIds,
        setActiveIds,
        activeParams,
        setActiveParams
      }}
    >
      <ChartInner {...props} data={data} flaggedPoints={flaggedPoints} />
    </ChartContext.Provider>
  )
}
