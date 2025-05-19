import type { Meta, StoryObj } from '@storybook/react'

import { simpleData, bigData, timeData } from './data'
import { Chart } from '@/Chart'

import './styles.css'

const meta: Meta<typeof Chart> = {
  title: 'Plots Only',
  component: Chart,
  args: {
    flagCallback: console.log,
    defaultShowAll: true
  }
}

export default meta
type Story = StoryObj<typeof Chart>;

export const SmallDataset: Story = {
  args: {
    data: simpleData,
    flaggedPoints: [{ traceName: 'INSTRUMENT_1-PARAM01', pointIndex: 1, endIndex: 4, flag: 'X' }]
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

export const CustomColours: Story = {
  args: {
    data: simpleData,
    plotColours: ['magenta', 'orange']
  }
}

export const CustomButtonStyle: Story = {
  args: {
    data: simpleData,
    buttonClassname: 'styled-button'
  }
}

export const DuplicateXValues: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 3, 4],
      series: [
        { name: 'PARAM01', values: [10, 20, 30, 40, 50] },
        { name: 'PARAM02', values: [5, 4, 60, 20, 14] }
      ]
    }
  }
}

export const UnorderedData: Story = {
  args: {
    data: {
      xValues: [1, 2, 3, 5, 4],
      series: [
        { name: 'PARAM01', values: [10, 20, 30, 100, 50] },
        { name: 'PARAM02', values: [5, 4, 60, 20, 14] }
      ]
    }
  }
}
