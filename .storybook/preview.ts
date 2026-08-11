import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Flagging', 'Plots Only', 'RealData', 'Customisation']
      }
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;