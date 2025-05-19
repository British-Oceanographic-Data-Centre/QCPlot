import { useContext, useMemo } from 'react'

import { CheckableLabel } from './CheckableLabel'
import { ChartContext } from '@/ChartContext'
import { DataSeries } from '@/types'

interface SeriesSelectProps {
  dataSeries: DataSeries[]
}

export const SeriesSelect = ({ dataSeries }: SeriesSelectProps) => {
  const { activeIds, setActiveIds, activeParams, setActiveParams } = useContext(ChartContext)

  const uniqueParams = useMemo(() => {
    const uniqParams: string[] = []
    dataSeries.forEach(x => {
      if (!uniqParams.includes(x.parameter)) uniqParams.push(x.parameter)
    })
    return uniqParams
  }, [dataSeries])

  const uniqueIds = useMemo(() => {
    const uniqIds: string[] = []
    dataSeries.forEach(x => {
      const id = x.formattedId || x.id
      if (!uniqIds.includes(id)) uniqIds.push(id)
    })
    return uniqIds
  }, [dataSeries])

  const onSelectAllIds = (checked: boolean) => setActiveIds(checked ? uniqueIds : [])
  const onSelectAllParams = (checked: boolean) => setActiveParams(checked ? uniqueParams : [])
  const onToggleId = (id: string) => {
    setActiveIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.concat(id))
  }
  const onToggleParam = (param: string) => {
    setActiveParams(prev => prev.includes(param) ? prev.filter(x => x !== param) : prev.concat(param))
  }

  return (
    <table className='pnf-table'>
      <thead>
        <tr>
          <th>
            <CheckableLabel onChange={onSelectAllIds} checked={activeIds.length === uniqueIds.length}>
              OID
            </CheckableLabel>
          </th>
          <th>
            <CheckableLabel onChange={onSelectAllParams} checked={activeParams.length === uniqueParams.length}>
              PARAMETER
            </CheckableLabel>
          </th>
        </tr>
      </thead>
      <tbody>
        {[...Array(Math.max(uniqueIds.length, uniqueParams.length))].map((_x, i) =>
          <tr key={i}>
            <td>
              {uniqueIds[i] &&
                <CheckableLabel onChange={() => onToggleId(uniqueIds[i])} checked={activeIds.includes(uniqueIds[i])}>
                  {uniqueIds[i]}
                </CheckableLabel>
              }
            </td>
            <td>
              {uniqueParams[i] &&
                <CheckableLabel
                  onChange={() => onToggleParam(uniqueParams[i])}
                  checked={activeParams.includes(uniqueParams[i])}
                >
                  {uniqueParams[i]}
                </CheckableLabel>
              }
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
