import { RefObject, useContext, useRef } from 'react'

import type uPlot from 'uplot'

import { Button } from './Button'
import { ChartContext } from '@/ChartContext'
import { FLAGS } from '@/constants'
import { getPointsForSelection, updateFlags } from '@/flagUtils'
import { Data, IndexedFlaggedPoint } from '@/types'

interface FlagButtonBarProps {
  plotRef: RefObject<uPlot | null>
  clearSelection: () => void
  data: Data
  flags: IndexedFlaggedPoint[]
}

export const FlagButtonBar = ({ clearSelection, plotRef, flags, data }: FlagButtonBarProps) => {
  const { flagCallback } = useContext(ChartContext)

  const flagSelect = useRef<HTMLSelectElement>(null)

  const applyFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    const flag = flagSelect.current?.value || null
    updateFlags({ selectedPoints, flag, existingFlags: flags, data, flagCallback })
  }

  const removeFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    updateFlags({ selectedPoints, flag: null, existingFlags: flags, data, flagCallback })
  }

  return (
    <div className='button-bar' style={{ marginTop: '5px' }}>
      <select ref={flagSelect}>
        <option></option>
        {FLAGS.map(x => <option key={x}>{x}</option>)}
      </select>
      <Button onClick={() => applyFlags()}>Apply flags</Button>
      <Button onClick={() => removeFlags()}>Remove flags</Button>
      <Button onClick={clearSelection}>Clear selection</Button>
    </div>
  )
}
