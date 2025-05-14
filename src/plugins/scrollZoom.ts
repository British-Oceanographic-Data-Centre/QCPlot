import type uPlot from 'uplot'

export const scrollZoomPlugin = () => {
  const factor = 0.75

  let xMin: number
  let xMax: number
  let yMin: number
  let yMax: number
  let xRange: number
  let yRange: number

  const clamp = (nRange: number, nMin: number, nMax: number, fRange: number, fMin: number, fMax: number) => {
    if (nRange > fRange) {
      nMin = fMin
      nMax = fMax
    } else if (nMin < fMin) {
      nMin = fMin
      nMax = fMin + nRange
    } else if (nMax > fMax) {
      nMax = fMax
      nMin = fMax - nRange
    }

    return [nMin, nMax]
  }

  return {
    hooks: {
      ready: (u: uPlot) => {
        xMin = u.scales.x.min!
        xMax = u.scales.x.max!
        yMin = u.scales.y.min!
        yMax = u.scales.y.max!

        xRange = xMax - xMin
        yRange = yMax - yMin

        const over = u.over
        const rect = over.getBoundingClientRect()

        // wheel drag pan
        over.addEventListener('mousedown', e => {
          if (e.button === 1) {
            // plot.style.cursor = "move";
            e.preventDefault()

            const left0 = e.clientX
            // let top0 = e.clientY;

            const scXMin0 = u.scales.x.min!
            const scXMax0 = u.scales.x.max!

            const xUnitsPerPx = u.posToVal(1, 'x') - u.posToVal(0, 'x')

            const onmove = (e: MouseEvent) => {
              e.preventDefault()

              const left1 = e.clientX
              // let top1 = e.clientY;

              const dx = xUnitsPerPx * (left1 - left0)

              u.setScale('x', {
                min: scXMin0 - dx,
                max: scXMax0 - dx
              })
            }

            const onup = (e: MouseEvent) => {
              document.removeEventListener('mousemove', onmove)
              document.removeEventListener('mouseup', onup)
            }

            document.addEventListener('mousemove', onmove)
            document.addEventListener('mouseup', onup)
          }
        })

        // wheel scroll zoom
        over.addEventListener('wheel', e => {
          e.preventDefault()

          const { left, top } = u.cursor

          const leftPct = left! / rect.width
          const btmPct = 1 - top! / rect.height
          const xVal = u.posToVal(left!, 'x')
          const yVal = u.posToVal(top!, 'y')
          const oxRange = u.scales.x.max! - u.scales.x.min!
          const oyRange = u.scales.y.max! - u.scales.y.min!

          const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor
          let nxMin = xVal - leftPct * nxRange
          let nxMax = nxMin + nxRange;
          [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax)

          const nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor
          let nyMin = yVal - btmPct * nyRange
          let nyMax = nyMin + nyRange;
          [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax)

          u.batch(() => {
            u.setScale('x', {
              min: nxMin,
              max: nxMax
            })

            u.setScale('y', {
              min: nyMin,
              max: nyMax
            })
          })
        })
      }
    }
  }
}
