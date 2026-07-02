import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { range } from 'lodash'

import { simpleData, bigData, timeData, makeScatter, combined } from './data'
import Template from './Template.mdx'
import { Chart } from '@/Chart'
import { DataSeries } from '@/types'

const meta: Meta<typeof Chart> = {
  component: Chart,
  parameters: {
    docs: {
      page: Template
    }
  },
  args: {
    flagCallback: console.log,
    defaultShowAll: true
  }
}

export default meta
type Story = StoryObj<typeof Chart>;

export const SmallDataset: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Another description on the story, overriding the comments'
      }
    }
  },
  args: {
    data: simpleData,
    flaggedPoints: [{ traceName: 'INSTRUMENT_1-PARAM01', pointIndex: 1, endIndex: 4, flag: 'X' }],
    height: 500
  }
}

export const LargeDataset: Story = {
  args: {
    data: bigData
  }
}

export const TimeData: Story = {
  args: {
    data: timeData,
    xTimeAxis: true
  }
}

export const GappyData: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 4, 5],
      series: [
        { id: '1', parameter: 'PARAM01', values: [10, null, 30, null, 15], spanGaps: true },
        { id: '1', parameter: 'PARAM02', values: [10, 30, 15, 7, 21] },
        { id: '1', parameter: 'PARAM03', values: [5, 6, null, 8, 9] }
      ]
    }
  }
}

export const DuplicateXValues: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 3, 4],
      series: [
        { id: '1', parameter: 'PARAM01', values: [10, 20, 30, 40, 50] },
        { id: '1', parameter: 'PARAM02', values: [5, 4, 60, 20, 14] }
      ]
    }
  }
}

export const UnorderedData: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 5, 4],
      series: [
        { id: '1', parameter: 'PARAM01', values: [10, 20, 30, 100, 50] },
        { id: '1', parameter: 'PARAM02', values: [5, 4, 60, 20, 14] }
      ]
    }
  }
}

export const FormattedIds: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 4, 5],
      series: [
        { id: '1', formattedId: '#1', parameter: 'PARAM01', values: [10, 20, 30, 100, 50] },
        { id: '1', formattedId: '#1', parameter: 'PARAM02', values: [5, 4, 60, 20, 14] }
      ]
    }
  }
}

export const BasicScatter: Story = {
  args: {
    data: makeScatter(2_000),
    xTimeAxis: false,
    scatterMode: true,
    enableFlagging: false,
    hideParameterSelect: true,
    defaultShowAll: true,
    height: 480
  }
}

export const ScatterMode5k: Story = {
  name: 'XY Scatter, 5k values (stays scatter)',
  args: {
    data: makeScatter(5_000),
    xTimeAxis: false,
    scatterMode: true,
    enableFlagging: false,
    hideParameterSelect: true,
    defaultShowAll: true,
    height: 500
  },
  parameters: { docs: { source: { state: 'closed' } } }
}

export const ScatterMode20k: Story = {
  name: 'XY Scatter, 20k values (auto line fallback)',
  args: {
    data: makeScatter(10_001),
    xTimeAxis: false,
    scatterMode: true,
    enableFlagging: false,
    hideParameterSelect: true,
    defaultShowAll: true,
    height: 500
  },
  parameters: { docs: { source: { state: 'closed' } } }
}

export const ScatterMode200k: Story = {
  name: 'XY Scatter, 200k values (stress test)',
  args: {
    data: makeScatter(200_000),
    xTimeAxis: false,
    scatterMode: true,
    hideParameterSelect: true,
    enableFlagging: false,
    defaultShowAll: true,
    height: 600
  },
  parameters: {
    chromatic: { disable: true },
    docs: { source: { state: 'closed' } }
  }
}

export const MultiOidXYScatter: Story = {
  args: {
    data: combined,
    xTimeAxis: false,
    scatterMode: true,
    enableFlagging: false,
    hideParameterSelect: true,
    defaultShowAll: false,
    height: 520
  }
}

export const VeryManySeries: Story = {
  args: {
    data: {
      xValues: range(1000).map(_ => 3),
      series: (() => {
        const series: DataSeries[] = []
        range(10).forEach(j => {
          range(1000).forEach(i => {
            series.push({
              id: `ID_${i}`,
              parameter: `PARAM_${j}`,
              values: ((i, j) => { const arr = []; arr[i] = j; return arr })(i, j)
            })
          })
        })
        return series
      })()
    },
    xTimeAxis: false,
    defaultShowAll: false,
    height: 520,
    scatterMode: true,
    verticalMode: true
  }
}
