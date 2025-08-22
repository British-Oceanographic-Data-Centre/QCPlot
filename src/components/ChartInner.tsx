import React, { useContext, useEffect, useRef, useState } from 'react'

import dayjs from 'dayjs'
import type uPlot from 'uplot'
import type { Options } from 'uplot'
import UplotReact from 'uplot-react'

import { onKeyDown } from '../eventHandlers'
import type { ChartProps, DataSeries, InitialRange } from '../types'
import { getArrayMinMax, getTraceName, seriesFromData } from '../utils'
import { FlagButtonBar } from './FlagButtonBar'
import { MainButtonBar } from './MainButtonBar'
import { MenuBar } from './MenuBar'
import { ChartContext } from '@/ChartContext'
import { PLOT_HELP_TEXT, PointDisplay } from '@/constants'
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

export const ChartInner = ({
  data,
  flaggedPoints = [],
  enableFlagging,
  xTimeAxis = false,
  height = 600
}: ChartProps) => {
  const [flagMode, setFlagMode] = useState(false)
  const [showPoints, setShowPoints] = useState<number>(PointDisplay.ALL)

  const { colours: plotColours, activeIds, activeParams } = useContext(ChartContext)

  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot>(null)
  const initialScales = useRef<InitialRange>(null)

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
    height,
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
            if (e.button === 0) {
              handler(e)
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
      init: [(u) => initHook(u, flagMode)],
      ready: [(u) => {
        if (!initialScales.current) {
          initialScales.current = {
            xMin: u.scales.x.min!,
            xMax: u.scales.x.max!,
            yMin: u.scales.y.min!,
            yMax: u.scales.y.max!
          }
        }
      }]
    },
    plugins: [
      renderFlagsPlugin(flaggedPoints, showPoints !== PointDisplay.HIDE_FLAGS),
      scrollZoomPlugin(initialScales.current)
    ],
    series,
    scales: {
      x: {
        time: xTimeAxis,
        min: plotRef.current ? plotRef.current.scales.x.min : undefined,
        max: plotRef.current ? plotRef.current.scales.x.max : undefined,
        range: (u, min, max) => {
          if (min >= u.data[0][0]) {
            const dataPadding = 0.05 * (max - min) // 5% of the total range
            return [min - dataPadding, max + dataPadding]
          } else {
            return [min, max]
          }
        }
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

  const filterFlaggedValues = (series: DataSeries) => {
    if (showPoints === PointDisplay.HIDE_FLAGS || showPoints === PointDisplay.FLAGS_ONLY) {
      const flaggedIndices = new Set<number>()
      const seriesFlags = flaggedPoints.filter(x => x.traceName === getTraceName(series))
      seriesFlags.forEach(x => {
        if (!x.endIndex) {
          flaggedIndices.add(x.pointIndex)
        } else {
          for (let i = x.pointIndex; i <= x.endIndex; i++) {
            flaggedIndices.add(i)
          }
        }
      })
      if (showPoints === PointDisplay.FLAGS_ONLY) {
        return series.values.map((v, i) => flaggedIndices.has(i) ? v : null)
      } else if (showPoints === PointDisplay.HIDE_FLAGS) {
        return series.values.map((v, i) => flaggedIndices.has(i) ? null : v)
      }
    }
    return series.values
  }

  return (
    <div ref={containerRef} className='pnf-container'>
      <MenuBar data={data} flaggedPoints={flaggedPoints} />

      {/* Control bar */}
      <div className='pnf-control-bar-outer'>
        <label>Display Points
          <select className='pnf-select' value={showPoints} onChange={e => setShowPoints(Number(e.target.value))}>
            <option value={PointDisplay.ALL}>All</option>
            <option value={PointDisplay.HIDE_FLAGS}>Hide Flags</option>
            <option value={PointDisplay.FLAGS_ONLY}>Flags Only</option>
          </select>
        </label>
        <button className='pnf-button' onClick={() => alert(PLOT_HELP_TEXT)}>?</button>
      </div>
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
                .map(s => filterFlaggedValues(s))
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
