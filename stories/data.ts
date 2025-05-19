import { random, range } from 'lodash'

import { Data } from '@/types'

export const simpleData: Data = {
  xValues: [11, 12, 13, 14, 15],
  series: [
    { id: '1', parameter: 'PARAM01', values: [10, 20, 30, 40, 50] },
    { id: '1', parameter: 'PARAM02', values: [5, 4, 60, 20, 14] },
    { id: '1', parameter: 'PARAM03', values: [46, 15, 43, 5, 27] },
    { id: '1', parameter: 'PARAM04', values: [1, 2, 3, 4, 5] }
  ]
}

export const bigData: Data = {
  xValues: range(500_000),
  series: [
    { id: '1', parameter: 'TEMP', values: range(500_000).map(i => (10 + random(0, 5, true)) * Math.sin(i / 500)) },
    { id: '1', parameter: 'PRES', values: range(500_000).map(i => 5 * Math.cos(i / 500)) }
  ]
}

export const timeData: Data = {
  xValues: ['2025-01-01T00:00:00.000Z', '2025-01-01T01:00:00.000Z', '2025-01-01T03:00:00.000Z'],
  series: [
    { id: '1', parameter: 'PARAM01', values: [10, 30, 15] }
  ]
}
