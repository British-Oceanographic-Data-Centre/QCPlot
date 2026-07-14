import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import dayjs from 'dayjs'
import type uPlot from 'uplot'
import type { Options } from 'uplot'
import UplotReact from 'uplot-react'

import { onKeyDown } from '../eventHandlers'
import type { ChartProps, DataSeries, InitialRange } from '../types'
import { extendArray, getArrayMinMax, getTraceName, isNil, nullPaddedIndexMap, seriesFromData } from '../utils'
import { Button } from './Button'
import { FlagButtonBar } from './FlagButtonBar'
import { MainButtonBar } from './MainButtonBar'
import { MenuBar } from './MenuBar'
import { ChartContext } from '@/ChartContext'
import { DEFAULT_COLOURS, PLOT_HELP_TEXT, PointDisplay } from '@/constants'
import { toggleDark, toggleFullscreen, updateFlagModeState } from '@/domUtils'
import { clearSelection, combineFlaggedPoints } from '@/flagUtils'
import { getScatterHoverIndex, nextId, nextParam, updateDisplayed } from '@/plotUtils'
import { renderFlagsPlugin, scrollZoomPlugin } from '@/plugins'
import { legendPlugin } from '@/plugins/legend'

const initHook = (u: uPlot, rightLegend?: boolean) => {
  if (rightLegend) {
    u.root.classList.add('rgt-leg')
  }

  document.addEventListener('keydown', onKeyDown(u), true)
}

/**
 * The core component of the library, includes the plot as well as the various accompanying controls.
 */
export const ChartInner = ({
  data,
  flaggedPoints = [],
  originatorFlaggedPoints = [],
  enableFlagging,
  xTimeAxis = false,
  height = 600,
  showCycleNumber = false,
  plotColours,
  verticalMode,
  scatterMode,
  hideParameterSelect = false,
  xAxisLabel,
  yAxisLabel,
  goodFlags = []
}: ChartProps) => {
  const { activeIds, activeParams, totalSeriesCount, allIds, allParams } = useContext(ChartContext)

  const [showPoints, setShowPoints] = useState<number>(PointDisplay.ALL)
  const [colours, setColours] = useState<string[]>(extendArray(plotColours || DEFAULT_COLOURS, totalSeriesCount))

  const flagModeRef = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot>(null)
  const initialScales = useRef<InitialRange>(null)
  const clientWidthRatio = verticalMode ? 0.5 : 1

  const allFlaggedPoints = combineFlaggedPoints(flaggedPoints, originatorFlaggedPoints)

  const toggleFlagMode = () => {
    if (!plotRef.current) return
    flagModeRef.current = !flagModeRef.current // Update stored ref value

    updateFlagModeState(plotRef.current, flagModeRef.current)
  }

  const onUnZoom = useCallback(() => {
    const u = plotRef.current
    if (!u) return
    let { min, max } = getArrayMinMax(xTimeAxis ? data.xValues.map(x => dayjs(x).unix()) : data.xValues as number[])
    if (min === max) {
      min -= 1
      max += 1
    }
    u.setScale('x', { min, max })
  }, [data.xValues, xTimeAxis])

  useEffect(() => {
    const handleResize = () => {
      if (plotRef.current && containerRef.current) {
        plotRef.current.setSize({
          width: containerRef.current?.clientWidth * clientWidthRatio,
          height: plotRef.current.height
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call now to set initial size
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [clientWidthRatio])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') {
        // Add the check so that it doesn't interfere with any inputs fields on the page
        return
      }
      switch (event.key.toUpperCase()) {
        case 'F':
          toggleFlagMode(); break
        case 'R':
          onUnZoom(); break
        case 'D':
          toggleDark(); break
        case 'B':
          toggleFullscreen(); break
        case 'Q':
          // Prev param
          nextParam(plotRef.current, allParams, activeIds, activeParams, -1); break
        case 'W':
          // next param
          nextParam(plotRef.current, allParams, activeIds, activeParams); break
        case 'A':
          // prev ID
          nextId(plotRef.current, allIds, activeIds, activeParams, -1); break
        case 'S':
          // next ID
          nextId(plotRef.current, allIds, activeIds, activeParams); break
        case 'ESCAPE':
          clearSelection(plotRef.current); break
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onUnZoom])

  const series = seriesFromData(
    data, allFlaggedPoints, colours, activeIds.current, activeParams.current, showCycleNumber, scatterMode
  )

  const opts: Options = {
    width: containerRef.current ? containerRef.current.clientWidth * clientWidthRatio : 800,
    height,
    cursor: {
      dataIdx: scatterMode ? getScatterHoverIndex : undefined,
      drag: {
        setScale: !flagModeRef.current,
        x: true,
        y: true
      },
      bind: {
        mousedown: (u, _target, handler) => {
          return e => {
            if (e.button === 0) {
              handler(e)
              if (flagModeRef.current) {
                u.root.querySelector('.u-select')?.classList.add('qcp-flag-select')
              }
            }
            return null
          }
        },
        dblclick: (u, _target, handler) => {
          return e => {
            handler(e)
            u.root.querySelector('.u-select')?.classList.remove('qcp-flag-select')
            onUnZoom()
            return null
          }
        }
      }
    },
    hooks: {
      init: [(u) => initHook(u, verticalMode)],
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
      renderFlagsPlugin(allFlaggedPoints, showPoints, scatterMode, goodFlags),
      scrollZoomPlugin(initialScales.current),
      legendPlugin(data.series, colours, setColours, scatterMode)
    ],
    series,
    scales: {
      x: {
        time: xTimeAxis,
        dir: verticalMode ? -1 : 1,
        ori: verticalMode ? 1 : 0,
        min: plotRef.current ? plotRef.current.scales.x.min : undefined,
        max: plotRef.current ? plotRef.current.scales.x.max : undefined,
        range: (u, min, max) => {
          if (min === u.data[0][0]) {
            const dataPadding = 0.05 * (max - min) // 5% of the total range
            return [min - dataPadding, max + dataPadding]
          } else {
            return [min, max]
          }
        }
      },
      y: {
        dir: verticalMode ? 1 : 1,
        ori: verticalMode ? 0 : 1,
        min: plotRef.current ? plotRef.current.scales.y.min : undefined,
        max: plotRef.current ? plotRef.current.scales.y.max : undefined
      }
    },
    select: plotRef.current ? plotRef.current.select : undefined,
    axes: [
      {
        side: verticalMode ? 3 : 2,
        label: xAxisLabel
      },
      {
        scale: 'y',
        side: verticalMode ? 0 : 3,
        label: yAxisLabel
      }
    ]
  }

  const filterFlaggedValues = (series: DataSeries) => {
    if (showPoints === PointDisplay.HIDE_FLAGS || showPoints === PointDisplay.FLAGS_ONLY) {
      const flaggedIndices = new Set<number>()
      const seriesFlags = allFlaggedPoints.filter(x => x.traceName === getTraceName(series))
      const offsetMap = nullPaddedIndexMap(series.values)
      seriesFlags.forEach(x => {
        if (!x.endIndex) {
          flaggedIndices.add(x.pointIndex + offsetMap[x.pointIndex])
        } else {
          for (let i = x.pointIndex; i <= x.endIndex; i++) {
            flaggedIndices.add(i + offsetMap[i])
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

  const zoomToRange = (traceName: string, xStart: number, xEnd: number) => {
    const u = plotRef.current
    if (!u) return

    // xStart and xEnd are indices for the non-null padded series
    // Need to do some adjustment to get the actual indices to use
    const seriesData = data.series.filter(x => getTraceName(x) === traceName)[0]
    let adjustedXStart = xStart
    let adjustedXEnd = xEnd
    let j = 0
    for (let i = 0; i < seriesData.values.length; i++) {
      if (!isNil(seriesData.values[i])) {
        if (j === xStart) adjustedXStart = i
        if (j === xEnd) adjustedXEnd = i
        j += 1
      }
    }

    let xMin: number, xMax: number
    if (adjustedXStart === adjustedXEnd) {
      xMin = u.data[0][Math.max(adjustedXStart - 1, 0)]
      xMax = u.data[0][Math.min(adjustedXEnd + 1, u.data[0].length - 1)]
    } else {
      xMin = u.data[0][Math.max(adjustedXStart, 0)]
      xMax = u.data[0][Math.min(adjustedXEnd, u.data[0].length - 1)]
      const diff = xMax - xMin
      xMin = xMin - 0.05 * diff
      xMax = xMax + 0.05 * diff
    }
    plotRef.current!.setScale('x', { min: xMin, max: xMax })
  }
  return (
    <div ref={containerRef} className='qcp-container'>
      <MenuBar
        data={data}
        flaggedPoints={allFlaggedPoints}
        zoomToRange={zoomToRange}
        plotRef={plotRef}
        colours={colours}
        hideFlagTab={!enableFlagging}
        hideParameterSelect={hideParameterSelect}
      />

      {/* Control bar */}
      <div className='qcp-control-bar-outer'>
        {enableFlagging
          ? (
              <label>Display Points
                <select className='qcp-select' value={showPoints} onChange={e => setShowPoints(Number(e.target.value))}>
                  <option value={PointDisplay.ALL}>All</option>
                  <option value={PointDisplay.HIDE_FLAGS}>Hide Flagged Data</option>
                  <option value={PointDisplay.FLAGS_ONLY}>Show Flagged Data Only</option>
                </select>
              </label>
            )
          : (
              <div />
            )}
        <Button onClick={() => alert(PLOT_HELP_TEXT)}>?</Button>
      </div>
      <div className='qcp-control-bar-outer'>
        <MainButtonBar
          flagMode={flagModeRef.current}
          toggleFlagMode={toggleFlagMode}
          onUnZoom={onUnZoom}
          enableFlagging={enableFlagging}
        />
        <FlagButtonBar
          clearSelection={clearSelection}
          plotRef={plotRef}
          flaggedPoints={allFlaggedPoints}
        />
      </div>
      {/* End control bar  */}

      <UplotReact
        options={opts}
        data={[
          xTimeAxis ? data.xValues.map(x => dayjs(x).unix()) : data.xValues as number[],
          ...data.series
            .map(s => filterFlaggedValues(s))
        ]}
        onCreate={(chart) => {
          if (!plotRef.current) {
            plotRef.current = chart
            updateDisplayed(chart, activeIds.current, activeParams.current)
            // Only do the unzoom if this is the first time through
            onUnZoom()
          } else {
            plotRef.current = chart
          }
        }}
      />
    </div>
  )
}
