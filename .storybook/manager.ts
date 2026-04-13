import { addons, type State } from 'storybook/manager-api'

addons.setConfig({
  layoutCustomisations: {
    showPanel: () => false, // hides the panel for all stories
  }
})
