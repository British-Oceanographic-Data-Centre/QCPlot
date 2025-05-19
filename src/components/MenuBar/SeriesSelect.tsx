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
    <div style={{ display: 'flex', gap: '2em' }}>
      <div>
        <CheckableLabel onChange={onSelectAllIds} checked={activeIds.length === uniqueIds.length}>
          OID
        </CheckableLabel>
        <hr />
        {uniqueIds.map(x =>
          <CheckableLabel key={x} onChange={() => onToggleId(x)} checked={activeIds.includes(x)}>
            {x}
          </CheckableLabel>
        )}
      </div>
      <div>
        <CheckableLabel onChange={onSelectAllParams} checked={activeParams.length === uniqueParams.length}>
          PARAMETER
        </CheckableLabel>
        <hr />
        {uniqueParams.map(x =>
          <CheckableLabel key={x} onChange={() => onToggleParam(x)} checked={activeParams.includes(x)}>
            {x}
          </CheckableLabel>
        )}
      </div>
    </div>
  )
}
