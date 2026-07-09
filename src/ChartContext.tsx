import { createContext } from 'react'

import { FlagSets } from './constants'
import type { ChartContextValue } from './types'

export const ChartContext = createContext<ChartContextValue>({
  totalSeriesCount: 0,
  activeIds: { current: [] },
  activeParams: { current: [] },
  flagset: FlagSets.ALPHABETICAL_FLAGS
})
