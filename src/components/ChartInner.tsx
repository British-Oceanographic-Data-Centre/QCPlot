import React, { useContext, useEffect, useRef, useState } from 'react'

import dayjs from 'dayjs'
import type uPlot from 'uplot'
import type { Options } from 'uplot'
import UplotReact from 'uplot-react'

import { onKeyDown } from '../eventHandlers'
import type { ChartProps } from '../types'
import { getArrayMinMax, seriesFromData } from '../utils'
import { FlagButtonBar } from './FlagButtonBar'
import { MainButtonBar } from './MainButtonBar'
import { MenuBar } from './MenuBar'
import { ChartContext } from '@/ChartContext'
import { renderFlagsPlugin, scrollZoomPlugin } from '@/plugins'

const initHook = (u: uPlot, flagMode: boolean) => {
  u.over.tabIndex = -1 // required for key handlers

  if (flagMode) {
    u.root.querySelector('.u-select')?.classList.add('pnf-flag-select')
  }

  u.over.addEventListener(
    'keydown',
    onKeyDown(u),
    true
  )
}

export const ChartInner = ({ data, flaggedPoints = [], enableFlagging, xTimeAxis = false }: ChartProps) => {
  const [flagMode, setFlagMode] = useState(false)

  const { colours: plotColours, activeIds, activeParams } = useContext(ChartContext)

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

  const series = seriesFromData(data, flaggedPoints, plotColours, activeIds, activeParams)

  const clearSelection = () => {
    if (plotRef.current) {
      plotRef.current.setSelect({ left: 0, top: 0, width: 0, height: 0 })
      plotRef.current.root.querySelector('.u-select')?.classList.remove('pnf-flag-select')
    }
  }

  const onUnZoom = () => {
    const u = plotRef.current
    if (!u) return
    const { min, max } = getArrayMinMax(xTimeAxis ? data.xValues.map(x => dayjs(x).unix()) : data.xValues as number[])
    u.setScale('x', { min, max })
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
                u.root.querySelector('.u-select')?.classList.add('pnf-flag-select')
              }
            }
            return null
          }
        },
        dblclick: (u, _target, handler) => {
          return e => {
            handler(e)
            u.root.querySelector('.u-select')?.classList.remove('pnf-flag-select')
            onUnZoom()
            return null
          }
        }
      }
    },
    hooks: {
      init: [(u) => initHook(u, flagMode)]
    },
    plugins: [
      renderFlagsPlugin(flaggedPoints),
      scrollZoomPlugin()
    ],
    series,
    scales: {
      x: {
        time: xTimeAxis,
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
    <div ref={containerRef} className='pnf-container'>
      <MenuBar data={data} flaggedPoints={flaggedPoints} />

      {/* Control bar */}
      <div className='pnf-control-bar-outer'>
        <MainButtonBar
          flagMode={flagMode}
          setFlagMode={setFlagMode}
          onUnZoom={onUnZoom}
          containerRef={containerRef}
          enableFlagging={enableFlagging}
        />
        {flagMode &&
          <FlagButtonBar
            clearSelection={clearSelection}
            plotRef={plotRef}
            data={data}
            flaggedPoints={flaggedPoints}
          />
        }
      </div>
      {/* End control bar  */}

      {(activeIds.length === 0 && activeParams.length === 0)
        ? <div>Nothing selected to plot</div>
        : <UplotReact
            options={opts}
            data={[
              xTimeAxis ? data.xValues.map(x => dayjs(x).unix()) : data.xValues as number[],
              ...data.series
                .filter(s => activeIds.includes(s.id) && activeParams.includes(s.parameter))
                .map(s => s.values)
            ]}
            onCreate={(chart) => {
              if (!plotRef.current) {
                plotRef.current = chart
                // Only do the unzoom if this is the first time through
                onUnZoom()
              } else {
                plotRef.current = chart
              }
            }}
          />
      }
    </div>
  )
}
