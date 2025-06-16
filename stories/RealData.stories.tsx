import React, { useState } from 'react'

import type { Meta } from '@storybook/react'

import data from './realData/data.json'
import importFlags from './realData/flags.json'
import { Chart } from '@/Chart'
import type { FlaggedPoint } from '@/types'

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
