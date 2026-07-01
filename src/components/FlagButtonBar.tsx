import { RefObject, useContext, useRef } from 'react'

import type uPlot from 'uplot'

import { Button } from './Button'
import { ChartContext } from '@/ChartContext'
import { FLAGS } from '@/constants'
import { getPointsForSelection, updateFlags } from '@/flagUtils'
import { FlaggedPoint } from '@/types'

interface FlagButtonBarProps {
  plotRef: RefObject<uPlot | null>
  clearSelection: (u: uPlot | null) => void
  flaggedPoints: FlaggedPoint[]
}

/**
 * Container for the flag controls, only visible when flagging mode is active.
 */
export const FlagButtonBar = ({ clearSelection, plotRef, flaggedPoints }: FlagButtonBarProps) => {
  const { flagCallback, flagset } = useContext(ChartContext)

  const flagSelect = useRef<HTMLSelectElement>(null)
  const flagsetKey = flagset as keyof typeof FLAGS | undefined
  const flagOptions = flagsetKey && FLAGS[flagsetKey] ? FLAGS[flagsetKey] : FLAGS.ALPHABETICAL_FLAGS

  const applyFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    const flag = flagSelect.current?.value || null
    updateFlags({ selectedPoints, flag, existingFlags: flaggedPoints, flagCallback })
  }

  const removeFlags = () => {
    if (!plotRef.current) return
    const selectedPoints = getPointsForSelection(plotRef.current)
    updateFlags({ selectedPoints, flag: null, existingFlags: flaggedPoints, flagCallback })
  }

  return (
    <div className='qcp-button-bar qcp-flag-controls qcp-hidden'>
      <select ref={flagSelect} className='qcp-select'>
        <option></option>
        {flagOptions.map(x => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <Button onClick={applyFlags}>Apply flags</Button>
      <Button onClick={removeFlags}>Remove flags</Button>
      <Button onClick={() => clearSelection(plotRef.current)}>Clear selection</Button>
    </div>
  )
}
