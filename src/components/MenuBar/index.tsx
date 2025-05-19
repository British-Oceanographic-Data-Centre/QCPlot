import { useState } from 'react'

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

export const MenuBar = ({ flaggedPoints, data }: MenuBarProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(Sections.SERIES)

  return (
    <div className={activeSection ? 'menu-bar menu-bar-open' : 'menu-bar'}>
      {Object.values(Sections).map(section =>
        <button
          key={section}
          onClick={() => { section === activeSection ? setActiveSection(null) : setActiveSection(section) }}
        >
          {section}
        </button>
      )}
      {activeSection === Sections.FLAG_LIST && <FlagList flaggedPoints={flaggedPoints} />}
      {activeSection === Sections.SERIES && <SeriesSelect dataSeries={data.series} />}
    </div>
  )
}
