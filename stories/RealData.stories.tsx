import React, { useState } from 'react'

import type { Meta } from '@storybook/nextjs-vite'

import data from './realData/data.json'
import importFlags from './realData/flags.json'
import data2 from './realData2/data.json'
import flags2 from './realData2/flags.json'
import data3 from './realData3/data.json'
import flags3 from './realData3/flags.json'
import data4 from './realData4/data.json'
import flags4 from './realData4/flags.json'
import { Chart } from '@/Chart'
import { combineRanges } from '@/flagUtils'
import type { Data, FlaggedPoint } from '@/types'
import { combinePlotData } from '@/utils'

const meta: Meta<typeof Chart> = {
  component: Chart
}

export default meta

export const RealDataDemo = () => {
  const [flags, setFlags] = useState<FlaggedPoint[]>(importFlags)

  return (
    <Chart
      data={data as Data}
      flaggedPoints={flags as FlaggedPoint[]}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      xTimeAxis
    />
  )
}

export const RealDataDemo2 = () => {
  const [flags, setFlags] = useState<FlaggedPoint[]>(combineRanges(flags2 as FlaggedPoint[]))

  return (
    <Chart
      data={data2 as Data}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      defaultShowAll
      xTimeAxis
    />
  )
}

export const RealDataDemo3 = () => {
  const [flags, setFlags] = useState<FlaggedPoint[]>(flags3 as FlaggedPoint[])

  return (
    <Chart
      data={data3 as Data}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      xTimeAxis
      showCycleNumber
    />
  )
}

export const RealDataDemo4 = () => {
  const [flags, setFlags] = useState<FlaggedPoint[]>(flags4 as FlaggedPoint[])

  return (
    <Chart
      data={combinePlotData(data4 as Data[], true, false)}
      flaggedPoints={flags}
      flagCallback={setFlags}
      enableFlagging
      showCycleNumber
      scatterMode
      verticalMode
      xTimeAxis={false}
    />
  )
}
