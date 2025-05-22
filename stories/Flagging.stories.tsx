import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import { bigData } from './data'
import { Chart } from '@/Chart'
import type { FlaggedPoint } from '@/types'

import './styles.css'

const meta: Meta<typeof Chart> = {
  component: Chart
}

export default meta

export const FlaggingDemo = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>([
    { traceName: 'INSTRUMENT_1-PARAM02', pointIndex: 3, flag: 'Z' },
    { traceName: 'INSTRUMENT_1-PARAM01', pointIndex: 2, endIndex: 3, flag: 'X' },
    { traceName: 'INSTRUMENT_1-PARAM02', pointIndex: 1, flag: 'Z' }
  ])

  return (
    <Chart
      data={{
        xValues: [11, 12, 13, 14, 15],
        series: [
          { id: 'INSTRUMENT_1', formattedId: 'INST_1', parameter: 'PARAM01', values: [10, 20, 30, 40, 50] },
          { id: 'INSTRUMENT_1', formattedId: 'INST_2', parameter: 'PARAM02', values: [5, 4, 60, 20, 14] },
          { id: 'INSTRUMENT_1', formattedId: 'INST_3', parameter: 'PARAM03', values: [46, 15, 43, 5, 27] },
          { id: 'INSTRUMENT_1', formattedId: 'INST_4', parameter: 'PARAM04', values: [1, 2, 3, 4, 5] }
        ]
      }}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
    />
  )
}

export const FlaggingDemoBigData = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>([])

  return (
    <Chart
      data={bigData}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
    />
  )
}
