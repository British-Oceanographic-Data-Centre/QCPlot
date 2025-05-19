import { createContext, SetStateAction } from 'react'

import { DEFAULT_COLOURS } from './constants'
import type { ChartContextValue } from './types'

export const ChartContext = createContext<ChartContextValue>({
  colours: DEFAULT_COLOURS,
  buttonClassname: '',
  activeIds: [],
  setActiveIds: function (value: SetStateAction<string[]>): void {
    throw new Error('Function not implemented.')
  },
  activeParams: [],
  setActiveParams: function (value: SetStateAction<string[]>): void {
    throw new Error('Function not implemented.')
  }
})
