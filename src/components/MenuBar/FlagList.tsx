import { DataSeries, FlaggedPoint } from '@/types'
import { isNil } from '@/utils'

interface FlagListProps {
  flaggedPoints: FlaggedPoint[]
  dataSeries: DataSeries[]
}

export const FlagList = ({ flaggedPoints, dataSeries }: FlagListProps) => {
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

  return (
    <div>
      <table className='pnf-table'>
        <thead>
          <tr>
            <th>Channel</th>
            <th>Flag</th>
            <th>Point(s)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedFlaggedPoints).sort().map(key =>
            <tr key={key}>
              <td>
                {traceNameToLabel(groupedFlaggedPoints[key][0].traceName)}
              </td>
              <td>{groupedFlaggedPoints[key][0].flag}</td>
              <td>
                {groupedFlaggedPoints[key].sort((a, b) => a.pointIndex - b.pointIndex).map(fp =>
                  isNil(fp.endIndex) || fp.pointIndex === fp.endIndex
                    ? fp.pointIndex
                    : `${fp.pointIndex}-${fp.endIndex}`
                ).join(', ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
