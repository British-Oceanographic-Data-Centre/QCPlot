import { expect, test } from 'vitest'

import { FlaggedPoint } from '@/types'
import {
  isNil, getTraceName, getSeriesLabel, getFlagForPoint, getArrayMinMax, extendArray, nullPaddedIndexMap
} from '@/utils'

test.each([
  { input: null, expectedOutput: true },
  { input: undefined, expectedOutput: true },
  { input: 0, expectedOutput: false },
  { input: false, expectedOutput: false },
  { input: [], expectedOutput: false },
  { input: {}, expectedOutput: false },
  { input: '', expectedOutput: false }
])('Passing %j to isNil should be %s', ({ input, expectedOutput }) => {
  expect(isNil(input)).toBe(expectedOutput)
})

test('getTraceName outputs correct format', () => {
  expect(
    getTraceName({ id: 'seriesId', parameter: 'parameter', values: [] })
  ).toBe('seriesId-parameter')
})

test.each([
  { testLabel: 'with formattedId', formattedId: 'niceId', expectedOutput: 'niceId-parameter' },
  { testLabel: 'without formattedId', formattedId: undefined, expectedOutput: 'seriesId-parameter' }
])('getSeriesLabel outputs correct format ($testLabel)', ({ formattedId, expectedOutput }) => {
  expect(
    getSeriesLabel({ id: 'seriesId', formattedId, parameter: 'parameter', values: [] })
  ).toBe(expectedOutput)
})

test('getFlagForPoint returns correct flag (for various cases)', () => {
  const flaggedPoints: FlaggedPoint[] = [
    { traceName: '', pointIndex: 0, flag: 'A' },
    { traceName: '', pointIndex: 1, endIndex: 3, flag: 'B' },
    { traceName: '', pointIndex: 5, flag: 'X' },
    { traceName: '', pointIndex: 5, flag: 'Y' }
  ]

  // Flag defined for single point
  expect(getFlagForPoint(flaggedPoints, 0)).toBe('A')
  // Flags defined for a range (check all points in the range)
  expect(getFlagForPoint(flaggedPoints, 1)).toBe('B')
  expect(getFlagForPoint(flaggedPoints, 2)).toBe('B')
  expect(getFlagForPoint(flaggedPoints, 3)).toBe('B')
  // Two flags defined for same point (current behaviour picks the one that is first in the array)
  expect(getFlagForPoint(flaggedPoints, 5)).toBe('X')
})

test.each([
  // This is odd but consistent with Math.min and Math.max
  { testLabel: 'empty array', inputArr: [], expectedMin: Infinity, expectedMax: -Infinity },
  { testLabel: 'single item array', inputArr: [15], expectedMin: 15, expectedMax: 15 },
  { testLabel: 'ordered array', inputArr: [1, 4, 9, 16], expectedMin: 1, expectedMax: 16 },
  { testLabel: 'reverse-ordered array', inputArr: [99.9, 88.8, 77.7], expectedMin: 77.7, expectedMax: 99.9 },
  { testLabel: 'disordered array', inputArr: [7, 1, 14, 61, 5, 0, 9], expectedMin: 0, expectedMax: 61 },
  { testLabel: 'with negatives', inputArr: [1, 2, -15, 17, -14], expectedMin: -15, expectedMax: 17 },
  { testLabel: 'with exp notation', inputArr: [100e-2, 1e2, 1e4, 1e5], expectedMin: 1, expectedMax: 100000 },
  // null & undefined should have no effect
  { testLabel: 'array with undefined', inputArr: [1, null, 2, undefined, 4], expectedMin: 1, expectedMax: 4 }
])('getArrayMinMax ($testLabel)', ({ inputArr, expectedMin, expectedMax }) => {
  const { min, max } = getArrayMinMax(inputArr as number[])
  if (inputArr.length > 0) {
    // This fails for empty array but is a sensible assertion the rest of the time
    // eslint-disable-next-line jest/no-conditional-expect
    expect(max).toBeGreaterThanOrEqual(min)
  }
  expect(min).toBe(expectedMin)
  expect(max).toBe(expectedMax)
})

test.each([
  { label: 'extend single element array', inputArr: ['1'], inputLength: 3, expectedOutput: ['1', '1', '1'] },
  {
    label: 'extend multi element array',
    inputArr: ['1', '2', '3'],
    inputLength: 5,
    expectedOutput: ['1', '2', '3', '1', '2']
  },
  { label: 'output shorter than input', inputArr: ['1', '2', '3'], inputLength: 2, expectedOutput: ['1', '2'] }

])('test extendArray: $label', ({ inputArr, inputLength, expectedOutput }) => {
  expect(extendArray(inputArr, inputLength)).toStrictEqual(expectedOutput)
})

test.each([
  { label: 'no nulls', inputArr: [1, 2, 3], expectedOutput: { 0: 0, 1: 0, 2: 0 } },
  { label: 'some nulls', inputArr: [1, null, 2, null, 3], expectedOutput: { 0: 0, 1: 1, 2: 2 } },
  { label: 'only nulls', inputArr: [null, null], expectedOutput: { } }
])('test nullPaddedIndexMap ($label)', ({ inputArr, expectedOutput }) => {
  expect(nullPaddedIndexMap(inputArr)).toStrictEqual(expectedOutput)
})
