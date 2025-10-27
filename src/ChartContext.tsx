import { createContext, SetStateAction } from 'react'

import { FlagSets, type ChartContextValue } from './types'

export const ChartContext = createContext<ChartContextValue>({
  buttonClassname: '',
  totalSeriesCount: 0,
  activeIds: [],
  setActiveIds: function (value: SetStateAction<string[]>): void {
    throw new Error('Function not implemented.')
  },
  activeParams: [],
  setActiveParams: function (value: SetStateAction<string[]>): void {
    throw new Error('Function not implemented.')
  },
  flagset: FlagSets.ALPHABETICAL_FLAGS
})
