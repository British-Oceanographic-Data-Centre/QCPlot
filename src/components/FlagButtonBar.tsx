import { RefObject, useContext, useRef } from 'react'

import type uPlot from 'uplot'

import { Button } from './Button'
import { ChartContext } from '@/ChartContext'
import { FLAGS } from '@/constants'
import { Data, IndexedFlaggedPoint, ISelectedPoints } from '@/types'

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
    const u = plotRef.current
    const lft = u.select.left
    const rgt = u.select.width + lft
    const top = u.select.top
    const bottom = u.select.height + top

    const leftIdx = u.posToIdx(lft)
    const rightIdx = u.posToIdx(rgt)
    const topVal = u.posToVal(top, 'y')
    const bottomVal = u.posToVal(bottom, 'y')

    const pointsToFlag: ISelectedPoints = {}
    u.data.slice(1).forEach((x, seriesIndex) => {
      pointsToFlag[seriesIndex] = []
      for (let i = leftIdx; i <= rightIdx; i++) {
        const xPos = u.valToPos(u.data[0][i], 'x')
        if (xPos < lft || xPos > rgt) continue
        const val = x[i]
        if (val === undefined || val === null) continue
        if (val >= bottomVal && val <= topVal) {
          pointsToFlag[seriesIndex].push(i)
        }
      }
    })
    const flag = flagSelect.current?.value
    const updatedFlags: IndexedFlaggedPoint[] = [...flags]
    if (flag) {
      Object.keys(pointsToFlag).forEach(idx => {
        const seriesIndex = Number(idx)
        const seriesName = data.series[seriesIndex].name
        pointsToFlag[seriesIndex].forEach(pointIndex => {
          updatedFlags.push({
            seriesIndex,
            seriesName,
            pointIndex,
            flag
          })
        })
      })
    }
    if (flagCallback) {
      flagCallback(updatedFlags)
    }
  }

  return (
    <div className='button-bar' style={{ marginTop: '5px' }}>
      <select ref={flagSelect}>
        <option></option>
        {FLAGS.map(x => <option key={x}>{x}</option>)}
      </select>
      <Button onClick={applyFlags}>Apply flags</Button>
      <Button onClick={clearSelection}>clear selection</Button>
    </div>
  )
}
