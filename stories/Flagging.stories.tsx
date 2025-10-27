import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import { bigData, simpleData } from './data'
import { Chart } from '@/Chart'
import type { FlaggedPoint } from '@/types'
import { FlagSets } from '@/types'

import './styles.css'

const meta: Meta<typeof Chart> = {
  component: Chart
}

export default meta

export const FlaggingDemo = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>([
    { traceName: 'INSTRUMENT_1-TEMPPR01', pointIndex: 3, flag: 'Z' },
    { traceName: 'INSTRUMENT_1-PREXPR01', pointIndex: 1, flag: 'Y' },
    { traceName: 'INSTRUMENT_1-PREXPR01', pointIndex: 2, endIndex: 3, flag: 'X' },
    { traceName: 'INSTRUMENT_1-TEMPPR01', pointIndex: 1, flag: 'Z' }
  ])

  return (
    <Chart
      data={{
        xValues: [11, 12, 13, 14, 15],
        series: [
          {
            id: 'INSTRUMENT_1',
            formattedId: 'INST_1',
            parameter: 'PREXPR01',
            values: [10, null, 30, 40, 50],
            spanGaps: true
          },
          { id: 'INSTRUMENT_1', formattedId: 'INST_2', parameter: 'TEMPPR01', values: [5, 4, 60, 20, 14] },
          { id: 'INSTRUMENT_1', formattedId: 'INST_3', parameter: 'LCEWZZ01', values: [46, 15, 43, 5, 27] },
          { id: 'INSTRUMENT_1', formattedId: 'INST_4', parameter: 'HEADCM01', values: [1, 2, 3, 4, 5] }
        ]
      }}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      showCycleNumber
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

export const SamplesFlagging = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>([])

  const data = {
    xValues: [11, 12, 13, 14, 15],
    series: [
      { id: 'INSTRUMENT_1', parameter: 'PREXPR01', values: [10, 20, 30, 40, 50] },
      { id: 'INSTRUMENT_1', parameter: 'TEMPPR01', values: [5, 4, 60, 20, 14] },
      { id: 'INSTRUMENT_1', parameter: 'LCEWZZ01', values: [46, 15, 43, 5, 27] },
      { id: 'INSTRUMENT_1', parameter: 'HEADCM01', values: [1, 2, 3, 4, 5] }
    ]
  }

  return (
    <Chart
      data={data}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      verticalMode
      scatterMode
    />
  )
}

export const NumericFlagset = () => {
  const [flags, setFlags] = useState<FlaggedPoint[]>([])

  return (
    <Chart
      data={simpleData}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      flagset={FlagSets.NUMERIC_FLAGS}
    />
  )
}
