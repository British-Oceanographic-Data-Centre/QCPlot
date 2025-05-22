import { useContext, useMemo } from 'react'

import { CheckableLabel } from './CheckableLabel'
import { ChartContext } from '@/ChartContext'
import { DataSeries } from '@/types'

interface SeriesSelectProps {
  dataSeries: DataSeries[]
}

interface IdPair {
  id: string
  formattedId?: string
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
    const uniqIds: IdPair[] = []
    const addedIds: string[] = []
    dataSeries.forEach(x => {
      if (!addedIds.includes(x.id)) {
        addedIds.push(x.id)
        uniqIds.push({ id: x.id, formattedId: x.formattedId })
      }
    })
    return uniqIds
  }, [dataSeries])

  const onSelectAllIds = (checked: boolean) => setActiveIds(checked ? uniqueIds.map(x => x.id) : [])
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
                <CheckableLabel
                  onChange={() => onToggleId(uniqueIds[i].id)}
                  checked={activeIds.includes(uniqueIds[i].id)}
                >
                  {uniqueIds[i].formattedId || uniqueIds[i].id}
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
