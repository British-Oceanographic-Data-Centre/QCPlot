import { FlaggedPoint } from '@/types'
import { isNil } from '@/utils'

interface FlagListProps {
  flaggedPoints: FlaggedPoint[]
}

export const FlagList = ({ flaggedPoints }: FlagListProps) => {
  const groupedFlaggedPoints: {[name: string]: FlaggedPoint[]} = {}
  flaggedPoints.forEach(fp => {
    const key = `${fp.traceName};${fp.flag}`
    if (!(key in groupedFlaggedPoints)) {
      groupedFlaggedPoints[key] = []
    }
    groupedFlaggedPoints[key].push(fp)
  })

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
              <td>{groupedFlaggedPoints[key][0].traceName}</td>
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
