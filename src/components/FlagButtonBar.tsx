import { RefObject, useContext, useRef } from 'react'

import type uPlot from 'uplot'

import { Button } from './Button'
import { ChartContext } from '@/ChartContext'
import { FLAGS } from '@/constants'
import { getPointsForSelection, updateFlags } from '@/flagUtils'
import { Data, FlaggedPoint } from '@/types'

interface FlagButtonBarProps {
  plotRef: RefObject<uPlot | null>
  clearSelection: () => void
  data: Data
  flaggedPoints: FlaggedPoint[]
}

export const FlagButtonBar = ({ clearSelection, plotRef, flaggedPoints, data }: FlagButtonBarProps) => {
  const { flagCallback } = useContext(ChartContext)

  const flagSelect = useRef<HTMLSelectElement>(null)

  const applyFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    const flag = flagSelect.current?.value || null
    updateFlags({ selectedPoints, flag, existingFlags: flaggedPoints, data, flagCallback })
  }

  const removeFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    updateFlags({ selectedPoints, flag: null, existingFlags: flaggedPoints, data, flagCallback })
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
