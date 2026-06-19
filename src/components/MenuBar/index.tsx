import { ReactNode, RefObject, useState } from 'react'

import type uPlot from 'uplot'

import { FlagList } from './FlagList'
import { SeriesSelect } from './SeriesSelect'
import { Data, FlaggedPoint } from '@/types'

enum Sections {
  SERIES = 'Series',
  FLAG_LIST = 'Flag List'
}

interface MenuBarProps {
  flaggedPoints: FlaggedPoint[]
  data: Data
  zoomToRange: (traceName: string, start: number, end: number) => void
  plotRef: RefObject<uPlot | null>
  colours: string[]
  hideFlagTab?: boolean,
  hideParameterSelect?: boolean
}

const TabButton = ({
  children,
  onClick,
  active
}: {
  children: ReactNode
  onClick: () => void
  active: boolean
}) => {
  return (
    <button onClick={onClick} className={active ? 'pnf-tab-button-active' : 'pnf-tab-button'}>
      {children}
    </button>
  )
}

/**
 * MenuBar component containing the series selection and flag list.
 */
export const MenuBar = ({
  flaggedPoints, data, zoomToRange, plotRef, colours, hideFlagTab, hideParameterSelect
}: MenuBarProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(Sections.SERIES)

  return (
    <div className='pnf-menu-bar'>
      <TabButton
        active={activeSection === Sections.SERIES}
        onClick={() =>
          setActiveSection(activeSection === Sections.SERIES ? null : Sections.SERIES)
        }
      >
        {Sections.SERIES}
      </TabButton>
      {!hideFlagTab &&
        <TabButton
          active={activeSection === Sections.FLAG_LIST}
          onClick={() =>
            setActiveSection(activeSection === Sections.FLAG_LIST ? null : Sections.FLAG_LIST)
          }
        >
          {Sections.FLAG_LIST}
        </TabButton>
      }
      <div className={activeSection ? 'pnf-menu-bar-open' : ''}>
        {activeSection === Sections.SERIES && (
          <SeriesSelect
            dataSeries={data.series}
            hideParameterSelect={hideParameterSelect}
          />
        )}

        {!hideFlagTab && activeSection === Sections.FLAG_LIST && (
          <FlagList
            flaggedPoints={flaggedPoints}
            dataSeries={data.series}
            zoomToRange={zoomToRange}
            plotRef={plotRef}
            colours={colours}
          />
        )}
      </div>
    </div>
  )
}
