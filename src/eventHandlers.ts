import uPlot from 'uplot'

/**
 * Define key down event handling for the plot.
 */
export const onKeyDown = (u: uPlot) => (e: KeyboardEvent) => {
  e.preventDefault()
  const isVertical = u.scales.x.ori === 1

  const horizontalScale = isVertical ? 'y' : 'x'
  const verticalScale = isVertical ? 'x' : 'y'

  const horizMin = u.scales[horizontalScale].min!
  const horizMax = u.scales[horizontalScale].max!
  const vertMin = u.scales[verticalScale].min!
  const vertMax = u.scales[verticalScale].max!
  const horizStep = (horizMax - horizMin) * 0.1
  const vertStep = (vertMax - vertMin) * 0.1

  let adjustment = 0
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (e.key === 'ArrowLeft') {
      adjustment = -horizStep
    } else {
      adjustment = horizStep
    }
    u.setScale(horizontalScale, { min: horizMin + adjustment, max: horizMax + adjustment })
    u.setScale(verticalScale, { min: vertMin, max: vertMax })
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    if (e.key === 'ArrowUp') {
      adjustment = isVertical ? -vertStep : vertStep
    } else {
      adjustment = isVertical ? vertStep : -vertStep
    }
    u.setScale(verticalScale, { min: vertMin + adjustment, max: vertMax + adjustment })
    u.setScale(horizontalScale, { min: horizMin, max: horizMax })
  }
}
