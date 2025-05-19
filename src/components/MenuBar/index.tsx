import { ReactNode, useState } from 'react'

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
}

const TabButton = ({ children, onClick, active }: {children: ReactNode, onClick: () => void, active: boolean}) => {
  return (
    <button onClick={onClick} className={active ? 'pnf-tab-button-active' : 'pnf-tab-button'}>
      {children}
    </button>
  )
}

export const MenuBar = ({ flaggedPoints, data }: MenuBarProps) => {
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
      {activeSection === Sections.FLAG_LIST && <FlagList flaggedPoints={flaggedPoints} />}
      {activeSection === Sections.SERIES && <SeriesSelect dataSeries={data.series} />}
    </div>
  )
}
