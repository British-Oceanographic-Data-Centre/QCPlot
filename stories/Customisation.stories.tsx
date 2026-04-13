import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import customCss from './custom.css?inline'
import { simpleData } from './data'
import { Chart } from '@/Chart'

const meta: Meta<typeof Chart> = {
  component: Chart,
  args: {
    flagCallback: console.log,
    defaultShowAll: true,
    enableFlagging: true
  }
}

export default meta
type Story = StoryObj<typeof Chart>;

export const CustomPlotColours: Story = {
  args: {
    data: simpleData,
    plotColours: ['magenta', 'orange']
  }
}

export const CustomBranding: Story = {
  args: {
    data: simpleData
  },
  decorators: [
    (Story) => (
      <>
        <style>{customCss}</style>
        <Story />
      </>
    )
  ]
}
