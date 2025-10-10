import { RefObject } from 'react'

import uPlot from 'uplot'

import { DataSeries, FlaggedPoint, NamedSeries } from '@/types'
import { getTraceName, isNil } from '@/utils'

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
  const groupedFlaggedPoints: {[name: string]: FlaggedPoint[]} = {}
  flaggedPoints.forEach(fp => {
    const key = `${fp.traceName};${fp.flag}`
    if (!(key in groupedFlaggedPoints)) {
      groupedFlaggedPoints[key] = []
    }
    groupedFlaggedPoints[key].push(fp)
  })

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

  const getSeriesFromKey = (key: string) => {
    const traceName = key.split(';')[0]
    return plotRef.current?.series.find(x => (x as NamedSeries).name === traceName)
  }

  const getColourFromKey = (key: string) => {
    if (!plotRef.current) return
    const traceName = key.split(';')[0]
    const seriesIndex = dataSeries.findIndex(x => getTraceName(x) === traceName)
    return colours[seriesIndex] || '#ffffff'
  }

  return (
    <div>
      <table className='pnf-table'>
        <thead>
          <tr>
            <th />
            <th>Channel</th>
            <th>Flag</th>
            <th>Point(s)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedFlaggedPoints).sort().map(key =>
            <tr
              key={key}
              className={getSeriesFromKey(key)?.show ? '' : 'pnf-faded'}
            >
              <td>
                <div style={{ width: '1em', height: '1em', border: `2px solid ${getColourFromKey(key)}` }} />
              </td>
              <td style={{ verticalAlign: 'top' }}>
                {traceNameToLabel(groupedFlaggedPoints[key][0].traceName)}
              </td>
              <td style={{ verticalAlign: 'top' }}>
                {groupedFlaggedPoints[key][0].flag}
              </td>
              <td>
                {groupedFlaggedPoints[key].sort((a, b) => a.pointIndex - b.pointIndex).map(fp =>
                  <button
                    key={fp.pointIndex}
                    className='pnf-link-btn'
                    onClick={() => zoomToRange(fp.traceName, fp.pointIndex, fp.endIndex || fp.pointIndex)}
                  >
                    {isNil(fp.endIndex) || fp.pointIndex === fp.endIndex
                      ? fp.pointIndex
                      : `${fp.pointIndex}-${fp.endIndex}`}
                  </button>
                ).map((item, index) => [index > 0 && ', ', item])}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
