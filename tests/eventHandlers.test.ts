import { expect, test, vi } from 'vitest'

import { onKeyDown } from '@/eventHandlers'

test.each([
  { keyPressed: 'ArrowLeft', expectedXMove: -1, expectedYMove: 0 },
  { keyPressed: 'ArrowRight', expectedXMove: 1, expectedYMove: 0 },
  { keyPressed: 'ArrowUp', expectedXMove: 0, expectedYMove: 1 },
  { keyPressed: 'ArrowDown', expectedXMove: 0, expectedYMove: -1 }
])('onKeyDown - standard orientation', ({ keyPressed, expectedXMove, expectedYMove }) => {
  const setScale = vi.fn()
  const preventDefault = vi.fn()
  const u = {
    scales: {
      x: { ori: 0, min: 0, max: 10 },
      y: { min: 20, max: 40 }
    },
    setScale
  }
  const event = { key: keyPressed, preventDefault }

  // @ts-expect-error - Only partially implementing uPlot/KeyboardEvent for the test
  onKeyDown(u)(event)

  expect(setScale).toHaveBeenCalledTimes(2)
  expect(setScale).toHaveBeenCalledWith('x', { min: 0 + expectedXMove * 1, max: 10 + expectedXMove * 1 })
  expect(setScale).toHaveBeenCalledWith('y', { min: 20 + expectedYMove * 2, max: 40 + expectedYMove * 2 })
  expect(preventDefault).toHaveBeenCalledOnce()
})

test.each([
  { keyPressed: 'ArrowLeft', expectedXMove: 0, expectedYMove: -1 },
  { keyPressed: 'ArrowRight', expectedXMove: 0, expectedYMove: 1 },
  { keyPressed: 'ArrowUp', expectedXMove: -1, expectedYMove: 0 },
  { keyPressed: 'ArrowDown', expectedXMove: 1, expectedYMove: 0 }
])('onKeyDown - vertical orientation', ({ keyPressed, expectedXMove, expectedYMove }) => {
  const setScale = vi.fn()
  const preventDefault = vi.fn()
  const u = {
    scales: {
      x: { ori: 1, min: 0, max: 10 },
      y: { min: 20, max: 40 }
    },
    setScale
  }
  const event = { key: keyPressed, preventDefault }

  // @ts-expect-error - Only partially implementing uPlot/KeyboardEvent for the test
  onKeyDown(u)(event)

  expect(setScale).toHaveBeenCalledTimes(2)
  expect(setScale).toHaveBeenCalledWith('x', { min: 0 + expectedXMove * 1, max: 10 + expectedXMove * 1 })
  expect(setScale).toHaveBeenCalledWith('y', { min: 20 + expectedYMove * 2, max: 40 + expectedYMove * 2 })
  expect(preventDefault).toHaveBeenCalledOnce()
})
