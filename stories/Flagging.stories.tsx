import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import { Chart } from '@/Chart'
import type { Data, FlaggedPoint } from '@/types'

import './styles.css'

const meta: Meta<typeof Chart> = {
  component: Chart
}

export default meta

const simpleData: Data = {
  xValues: [11, 12, 13, 14, 15],
  series: [
    { name: 'PARAM01', values: [10, 20, 30, 40, 50] },
    { name: 'PARAM02', values: [5, 4, 60, 20, 14] },
    { name: 'PARAM03', values: [46, 15, 43, 5, 27] },
    { name: 'PARAM04', values: [1, 2, 3, 4, 5] }
  ]
}

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
    />
  )
}
