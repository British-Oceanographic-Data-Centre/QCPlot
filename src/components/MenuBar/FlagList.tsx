import { RefObject } from 'react'

import uPlot from 'uplot'

import { cleanFlaggedPoints } from '@/flagUtils'
import { DataSeries, FlaggedPoint, NamedSeries } from '@/types'
import { getTraceName } from '@/utils'

interface FlagListProps {
  flaggedPoints: FlaggedPoint[]
  dataSeries: DataSeries[]
  zoomToRange: (traceName: string, start: number, end: number) => void
  plotRef: RefObject<uPlot | null>
  colours: string[]
}

/**
 * Table showing a list of all flags currently applied to the data.
 */
export const FlagList = ({ flaggedPoints, dataSeries, zoomToRange, plotRef, colours }: FlagListProps) => {
  const traceNameToLabel = (traceName: string) => {
    const lastSeparator = traceName.lastIndexOf('-')
    const id = traceName.substring(0, lastSeparator)
    const param = traceName.substring(lastSeparator + 1)

    const series = dataSeries.filter(x => x.id === id)[0]
    if (series) {
      return `${series.formattedId || series.id}-${param}`
    }
    return traceName
  }

  const getSeriesFromTraceName = (traceName: string) => {
    return plotRef.current?.series.find(x => (x as NamedSeries).name === traceName)
  }

  const getColourFromTraceName = (traceName: string) => {
    if (!plotRef.current) return
    const seriesIndex = dataSeries.findIndex(x => getTraceName(x) === traceName)
    return colours[seriesIndex] || '#ffffff'
  }

  return (
    <div>
      <table className='qcp-table'>
        <thead>
          <tr>
            <th />
            <th>Channel</th>
            <th>Flag</th>
            <th>X values</th>
          </tr>
        </thead>
        <tbody>
          {cleanFlaggedPoints(flaggedPoints)
            .sort((a, b) => `${a.traceName};${a.flag}`.localeCompare(`${b.traceName};${b.flag}`))
            .map(fp =>
              <tr
                key={`${fp.traceName};${fp.flag}`}
                className={getSeriesFromTraceName(fp.traceName)?.show ? '' : 'qcp-faded'}
              >
                <td>
                  <div
                    style={{ width: '1em', height: '1em', border: `2px solid ${getColourFromTraceName(fp.traceName)}` }}
                  />
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  {traceNameToLabel(fp.traceName)}
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  {fp.flag}
                </td>
                <td>
                  <button
                    className='qcp-link-btn'
                    onClick={() => zoomToRange(fp.traceName, Math.min(...fp.xValues), Math.max(...fp.xValues))}
                  >
                    {fp.xValues.sort().join(', ')}
                  </button>
                </td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  )
}
