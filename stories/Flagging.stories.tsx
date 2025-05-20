import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import { bigData, simpleData } from './data'
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
      data={simpleData}
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
