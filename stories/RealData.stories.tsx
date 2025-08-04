import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import data from './realData/data.json'
import importFlags from './realData/flags.json'
import data2 from './realData2/data.json'
import flags2 from './realData2/flags.json'
import { Chart } from '@/Chart'
import type { FlaggedPoint } from '@/types'

import { combineRanges } from '@/flagUtils'

import './styles.css'

const meta: Meta<typeof Chart> = {
  component: Chart
}

export default meta

export const RealDataDemo = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>(importFlags)

  return (
    <Chart
      data={data}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      xTimeAxis
    />
  )
}

export const RealDataDemo2 = (args, context) => {
  const [flags, setFlags] = useState<FlaggedPoint>(combineRanges(flags2))

  return (
    <Chart
      data={data2}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      xTimeAxis
    />
  )
}
