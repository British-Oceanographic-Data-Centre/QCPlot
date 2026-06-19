import React from 'react'

import type uPlot from 'uplot'

import { DataSeries, NamedSeries } from '@/types'
import { getTraceName } from '@/utils'

/**
 * uPlot plugin to customise the legend.
 * - Changes the marker colour icons to be inputs to update the colour
 */
export const legendPlugin = (
  series: DataSeries[],
  colours: string[],
  setColours: React.Dispatch<React.SetStateAction<string[]>>,
  scatterMode = false
): uPlot.Plugin => {
  const addColourInputs = (u: uPlot) => {
    u.root.querySelectorAll('.u-marker').forEach((node, i) => {
      if (i > 0) {
        const seriesIndex = series.findIndex(x => getTraceName(x) === (u.series[i] as NamedSeries).name)
        const colourInput = document.createElement('input')
        colourInput.type = 'color'
        colourInput.className = 'pnf-colour-input'
        colourInput.value = colours[seriesIndex]
        colourInput.onchange = (e) => setColours(prev => {
          const updated = [...prev]
          updated[seriesIndex] = (e.target as HTMLInputElement).value
          return updated
        })
        node.appendChild(colourInput)
      }
      node.addEventListener(
        'click',
        e => {
          e.stopImmediatePropagation()
        }
      )
    })
  }

  return {
    hooks: {
      ready: (u: uPlot) => {
        if (scatterMode) {
          u.root.querySelector('.u-series')?.remove()
        }
        addColourInputs(u)
      }
    }
  }
}
