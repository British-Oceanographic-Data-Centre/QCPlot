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
}

const TabButton = ({ children, onClick, active }: {children: ReactNode, onClick: () => void, active: boolean}) => {
  return (
    <button onClick={onClick} className={active ? 'pnf-tab-button-active' : 'pnf-tab-button'}>
      {children}
    </button>
  )
}

/**
 * MenuBar component containing the series selection and flag list.
 */
export const MenuBar = ({ flaggedPoints, data, zoomToRange, plotRef }: MenuBarProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(Sections.SERIES)

  return (
    <div className={activeSection ? 'pnf-menu-bar pnf-menu-bar-open' : 'pnf-menu-bar'}>
      {Object.values(Sections).map(section =>
        <TabButton
          key={section}
          active={section === activeSection}
          onClick={() => { section === activeSection ? setActiveSection(null) : setActiveSection(section) }}
        >
          {section}
        </TabButton>
      )}
      {activeSection === Sections.FLAG_LIST &&
        <FlagList flaggedPoints={flaggedPoints} dataSeries={data.series} zoomToRange={zoomToRange} plotRef={plotRef} />
      }
      {activeSection === Sections.SERIES && <SeriesSelect dataSeries={data.series} />}
    </div>
  )
}
