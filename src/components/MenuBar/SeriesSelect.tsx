import { RefObject, useContext, useEffect, useMemo, useState } from 'react'

import type uPlot from 'uplot'

import { CheckableLabel } from './CheckableLabel'
import { ChartContext } from '@/ChartContext'
import { P01_BASE_URL } from '@/constants'
import { updateDisplayed } from '@/plotUtils'
import { DataSeries } from '@/types'

interface SeriesSelectProps {
  dataSeries: DataSeries[]
  hideParameterSelect?: boolean
  plotRef: RefObject<uPlot | null>
}

interface IdPair {
  id: string
  formattedId?: string
}

/**
 * Component to select which series are visible on the plot.
 */
export const SeriesSelect = ({ dataSeries, hideParameterSelect, plotRef }: SeriesSelectProps) => {
  const [paramLabels, setParamLabels] = useState<{[key: string]: string}>({})

  const { activeIds, activeParams } = useContext(ChartContext)

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

  const onSelectAllIds = (checked: boolean) => {
    activeIds.current = checked ? uniqueIds.map(x => x.id) : []
    document.querySelectorAll('.qcp-id-check').forEach(x => {
      const el = x as HTMLInputElement
      el.checked = checked
    })
    updateDisplayed(plotRef.current, activeIds.current, activeParams.current)
  }
  const onSelectAllParams = (checked: boolean) => {
    activeParams.current = checked ? uniqueParams : []
    document.querySelectorAll('.qcp-param-check').forEach(x => {
      const el = x as HTMLInputElement
      el.checked = checked
    })
    updateDisplayed(plotRef.current, activeIds.current, activeParams.current)
  }
  const onToggleId = (id: string) => {
    const prev = activeIds.current
    activeIds.current = prev.includes(id) ? prev.filter(x => x !== id) : prev.concat(id)
    updateDisplayed(plotRef.current, activeIds.current, activeParams.current)
  }
  const onToggleParam = (param: string) => {
    const prev = activeParams.current
    activeParams.current = prev.includes(param) ? prev.filter(x => x !== param) : prev.concat(param)
    updateDisplayed(plotRef.current, activeIds.current, activeParams.current)
  }

  useEffect(() => {
    const promises = []
    for (let i = 0; i < uniqueParams.length; i++) {
      const param = uniqueParams[i].toUpperCase()
      promises.push(
        fetch(`${P01_BASE_URL}/${param}/?_profile=nvs&_mediatype=application/ld+json`)
          .then(resp =>
            resp.json().then(data => ({ param, label: data['skos:prefLabel']['@value'] }))
          )
          .catch(() => { /* do nothing */ })
      )
    }
    Promise.all(promises).then(resps => {
      const paramLabels: {[key: string]: string} = {}
      resps.forEach(x => { if (x) paramLabels[x.param] = x.label })
      setParamLabels(paramLabels)
    })
  }, [uniqueParams])

  return (
    <table className='qcp-table'>
      <thead>
        <tr>
          <th>
            <CheckableLabel
              onChange={onSelectAllIds}
              defaultChecked={activeIds.current.length === uniqueIds.length}
            >
              OID
            </CheckableLabel>
          </th>

          {!hideParameterSelect && <th>
            <CheckableLabel
              onChange={onSelectAllParams}
              defaultChecked={activeParams?.current.length === uniqueParams.length}
            >
              PARAMETER
            </CheckableLabel>
          </th>
          }
        </tr>
      </thead>
      <tbody>
        {[...Array(Math.max(uniqueIds.length, uniqueParams.length))].map((_x, i) =>
          <tr key={i}>
            <td>
              {uniqueIds[i] &&
                <CheckableLabel
                  onChange={() => onToggleId(uniqueIds[i].id)}
                  defaultChecked={activeIds.current.includes(uniqueIds[i].id)}
                  inputClass='qcp-id-check'
                >
                  {uniqueIds[i].formattedId || uniqueIds[i].id}
                </CheckableLabel>
              }
            </td>
            {!hideParameterSelect &&
              <td>
                {uniqueParams[i] &&
                <CheckableLabel
                  onChange={() => onToggleParam(uniqueParams[i])}
                  defaultChecked={activeParams?.current.includes(uniqueParams[i])}
                  tooltip={paramLabels[uniqueParams[i]]}
                  inputClass='qcp-param-check'
                >
                  {uniqueParams[i]}
                </CheckableLabel>
                }
              </td>
            }
          </tr>
        )}
      </tbody>
    </table>
  )
}
