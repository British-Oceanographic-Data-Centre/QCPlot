import { test, expect } from 'vitest'

import { combineFlaggedPoints, combineRanges, getPointRanges, splitRanges } from '@/flagUtils'

test.each([
  { label: 'single continuous range', inputArr: [1, 2, 3], expectedOutput: [{ start: 1, end: 3 }] },
  { label: 'two ranges', inputArr: [1, 2, 4, 5], expectedOutput: [{ start: 1, end: 2 }, { start: 4, end: 5 }] },
  {
    label: 'multiple single point ranges',
    inputArr: [1, 4, 6],
    expectedOutput: [{ start: 1, end: 1 }, { start: 4, end: 4 }, { start: 6, end: 6 }]
  },
  { label: 'empty input', inputArr: [], expectedOutput: [] }
])('test getPointRanges: $label', ({ inputArr, expectedOutput }) => {
  expect(getPointRanges(inputArr)).toStrictEqual(expectedOutput)
})

test.each([
  { label: 'empty input', inputArr: [], expectedOutput: [] },
  {
    label: 'no end index',
    inputArr: [{ traceName: 'a', pointIndex: 0, flag: 'X' }],
    expectedOutput: [{ traceName: 'a', pointIndex: 0, flag: 'X' }]
  },
  {
    label: 'with end index',
    inputArr: [{ traceName: 'a', pointIndex: 0, endIndex: 2, flag: 'X' }],
    expectedOutput: [
      { traceName: 'a', pointIndex: 0, flag: 'X', endIndex: undefined },
      { traceName: 'a', pointIndex: 1, flag: 'X', endIndex: undefined },
      { traceName: 'a', pointIndex: 2, flag: 'X', endIndex: undefined }
    ]
  }
])('test splitRanges: $label', ({ inputArr, expectedOutput }) => {
  expect(splitRanges(inputArr)).toStrictEqual(expectedOutput)
})

test.each([
  { label: 'empty input', inputArr: [], expectedOutput: [] },
  {
    label: 'no end index',
    expectedOutput: [{ traceName: 'a', pointIndex: 0, flag: 'X', endIndex: 0 }],
    inputArr: [{ traceName: 'a', pointIndex: 0, flag: 'X' }]
  },
  {
    label: 'with end index',
    expectedOutput: [{ traceName: 'a', pointIndex: 0, endIndex: 2, flag: 'X' }],
    inputArr: [
      { traceName: 'a', pointIndex: 0, flag: 'X' },
      { traceName: 'a', pointIndex: 1, flag: 'X' },
      { traceName: 'a', pointIndex: 2, flag: 'X' }
    ]
  }
])('test combineRanges: $label', ({ inputArr, expectedOutput }) => {
  expect(combineRanges(inputArr)).toStrictEqual(expectedOutput)
})

test.each([
  { label: 'empty input', inputPoints: [], inputOriginatorPoints: [], expectedOutput: [] },
  {
    label: 'basic use case',
    inputPoints: [{ traceName: 'a', pointIndex: 1, endIndex: 2, flag: 'X' }],
    inputOriginatorPoints: [{ traceName: 'a', pointIndex: 0, endIndex: 2, flag: 'Y' }],
    expectedOutput: [
      { traceName: 'a', pointIndex: 0, endIndex: 0, flag: 'Y' },
      { traceName: 'a', pointIndex: 1, endIndex: 2, flag: 'X' }
    ]
  }
])('test combineFlaggedPoints: $label', ({ inputPoints, inputOriginatorPoints, expectedOutput }) => {
  expect(combineFlaggedPoints(inputPoints, inputOriginatorPoints)).toStrictEqual(expectedOutput)
})
