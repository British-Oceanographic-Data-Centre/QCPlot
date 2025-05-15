import React, { useContext, useEffect, useRef, useState } from 'react'

import type uPlot from 'uplot'
import type { Options } from 'uplot'
import UplotReact from 'uplot-react'

import { onKeyDown } from '../eventHandlers'
import type { InnerChartProps } from '../types'
import { seriesFromData } from '../utils'
import { FlagButtonBar } from './FlagButtonBar'
import { MainButtonBar } from './MainButtonBar'
import { ChartContext } from '@/ChartContext'
import { renderFlagsPlugin, scrollZoomPlugin } from '@/plugins'

const initHook = (u: uPlot, flagMode: boolean) => {
  u.over.tabIndex = -1 // required for key handlers

  if (flagMode) {
    u.root.querySelector('.u-select')?.classList.add('flag-select')
  }

  u.over.addEventListener(
    'keydown',
    onKeyDown(u),
    true
  )
}

export const ChartInner = ({ data, flags }: InnerChartProps) => {
  const [flagMode, setFlagMode] = useState(false)

  const { colours: plotColours } = useContext(ChartContext)

  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot>(null)

  useEffect(() => {
    const handleResize = () => {
      if (plotRef.current && containerRef.current) {
        plotRef.current.setSize({
          width: containerRef.current?.clientWidth,
          height: plotRef.current.height
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call now to set initial size
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!flagMode) {
      clearSelection()
    }
  }, [flagMode])

  const series = seriesFromData(data, flags, plotColours)

  const clearSelection = () => {
    if (plotRef.current) {
      plotRef.current.setSelect({ left: 0, top: 0, width: 0, height: 0 })
      plotRef.current.root.querySelector('.u-select')?.classList.remove('flag-select')
    }
  }

  const opts: Options = {
    width: containerRef.current ? containerRef.current.clientWidth : 800,
    height: 600,
    cursor: {
      drag: {
        setScale: !flagMode,
        x: true,
        y: true
      },
      hover: {
        prox: 5,
        bias: 0
      },
      bind: {
        mousedown: (u, _target, handler) => {
          return e => {
            handler(e)
            if (e.button === 0) {
              if (flagMode) {
                u.root.querySelector('.u-select')?.classList.add('flag-select')
              }
            }
            return null
          }
        },
        dblclick: (u, _target, handler) => {
          return e => {
            handler(e)
            u.root.querySelector('.u-select')?.classList.remove('flag-select')
            return null
          }
        }
      }
    },
    hooks: {
      init: [(u) => initHook(u, flagMode)]
    },
    plugins: [
      renderFlagsPlugin(flags),
      scrollZoomPlugin()
    ],
    series,
    scales: {
      x: {
        time: false,
        min: plotRef.current ? plotRef.current.scales.x.min : undefined,
        max: plotRef.current ? plotRef.current.scales.x.max : undefined
      },
      y: {
        min: plotRef.current ? plotRef.current.scales.y.min : undefined,
        max: plotRef.current ? plotRef.current.scales.y.max : undefined
      }
    },
    select: plotRef.current ? plotRef.current.select : undefined,
    axes: [
      {},
      { scale: 'y' }
    ]
  }

  return (
    <div ref={containerRef} className='w-full'>
      {/* Control bar */}
      <div className='control-bar-outer'>
        <MainButtonBar
          flagMode={flagMode} setFlagMode={setFlagMode} plotRef={plotRef} containerRef={containerRef}
        />
        {flagMode &&
          <FlagButtonBar
            clearSelection={clearSelection}
            plotRef={plotRef}
            data={data}
            flags={flags}
          />
        }
      </div>
      {/* End control bar  */}

      <UplotReact
        options={opts}
        data={[
          data.xValues,
          ...data.series.map(s => s.values)
        ]}
        onCreate={(chart) => { plotRef.current = chart }}
      />
    </div>
  )
}
