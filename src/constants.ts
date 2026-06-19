export const DEFAULT_COLOURS = [
  '#00b5ff',
  '#ff82ff',
  '#5ed496',
  '#ffe50a',
  '#eb1f24',
  '#a82ba3',
  '#1e7f3f',
  '#ffaf0a',
  '#777777',
  '#ff8700',
  '#004c96',
  '#804f4d',
  '#858080'
]

export const FLAGS: {[key: string]: string[]} = {
  ALPHABETICAL_FLAGS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<>'.split(''),
  NUMERIC_FLAGS: '123456789'.split('')
}

export enum FlagSets {
  ALPHABETICAL_FLAGS = 'ALPHABETICAL_FLAGS',
  NUMERIC_FLAGS = 'NUMERIC_FLAGS'
}

export enum PointDisplay {
  ALL,
  FLAGS_ONLY,
  HIDE_FLAGS
}

export const PLOT_HELP_TEXT = `
  Plot controls
  - While holding Ctrl use the mouse wheel to zoom
  - Drawing a box with the left mouse button:
    - If flag mode is off will zoom onto that region
    - With flag mode on will select all points in that region to be flagged
  - Clicking the colour boxes in the legend will allow you to customise the colours
  - Hot keys
    - F: toggle flag mode
    - R: reset zoom to default level
    - D: toggle dark mode
    - Esc: Clear current flagging selection
`

export const VOCAB_HOST = 'https://vocab.nerc.ac.uk'
export const P01_BASE_URL = `${VOCAB_HOST}/collection/P01/current`
