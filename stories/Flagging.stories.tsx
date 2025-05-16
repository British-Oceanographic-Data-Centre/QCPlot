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
    { seriesName: 'PARAM01', pointIndex: 2, endIndex: 3, flag: 'X' },
    { seriesName: 'PARAM02', pointIndex: 1, flag: 'Z' }
  ])

  return (
    <Chart
      data={simpleData}
      flags={flags}
      flagCallback={setFlags}
      enableFlagging
    />
  )
}

export const FlaggingDemoBigData = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>([])

  return (
    <Chart
      data={bigData}
      flags={flags}
      flagCallback={setFlags}
      enableFlagging
    />
  )
}
