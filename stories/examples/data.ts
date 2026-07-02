import { random, range } from 'lodash'

import { Data } from '@/types'

export const simpleData: Data = {
  xValues: [11, 12, 13, 14, 15],
  series: [
    { id: 'INSTRUMENT_1', parameter: 'PREXPR01', values: [10, 20, 30, 40, 50] },
    { id: 'INSTRUMENT_1', parameter: 'TEMPPR01', values: [5, 4, 60, 20, 14] },
    { id: 'INSTRUMENT_1', parameter: 'LCEWZZ01', values: [46, 15, 43, 5, 27] },
    { id: 'INSTRUMENT_1', parameter: 'HEADCM01', values: [1, 2, 3, 4, 5] }
  ]
}

export const bigData: Data = {
  xValues: range(500_000),
  series: [
    { id: '1', parameter: 'TEMPPR01', values: range(500_000).map(i => (10 + random(0, 5, true)) * Math.sin(i / 500)) },
    { id: '1', parameter: 'PREXPR01', values: range(500_000).map(i => 5 * Math.cos(i / 500)) }
  ]
}

export const timeData: Data = {
  xValues: ['2025-01-01T00:00:00.000Z', '2025-01-01T01:00:00.000Z', '2025-01-01T03:00:00.000Z'],
  series: [
    { id: '1', parameter: 'TEMPPR01', values: [10, 30, 15] }
  ]
}

/**
 * Generate a scatter dataset with n points.
 *
 * @param n - number of points to generate (default 300)
 * @returns an object with xValues and a single series named 'scatter'
 */
export const makeScatter = (n = 300) => {
  const xs = new Array<number>(n)
  const ys = new Array<number>(n)
  for (let i = 0; i < n; i++) {
    const x = (i - n / 2) / 10
    xs[i] = x
    ys[i] = Math.sin(x) + (Math.random() - 0.5) * 0.2
  }
  return {
    xValues: xs,
    series: [{ id: 'scatter', parameter: 'V_vs_U', values: ys, spanGaps: false }]
  }
}

type SeriesLike = { id: string; formattedId?: string; parameter: string; values: (number|null)[] }
type DataLike = { xValues: number[]; series: SeriesLike[] }

/**
 * Create a union of all X values across multiple datasets and pad each series'
 * values so that every series aligns with the unified X axis.
 *
 * @param datasets - array of DataLike objects; each provides xValues and series
 * @returns a DataLike object with xValues set to the sorted union of all input
 *          xValues and series padded with nulls where an x value was missing
 */
export const unionPad = (datasets: DataLike[]): DataLike => {
  // 1) union X
  const xSet = new Set<number>()
  datasets.forEach(d => d.xValues.forEach(x => xSet.add(x)))
  const xUnion = Array.from(xSet).sort((a, b) => a - b)

  // 2) per-dataset, map original x index
  const resultSeries: SeriesLike[] = []
  datasets.forEach(d => {
    const idx: Record<number, number> = {}
    d.xValues.forEach((x, i) => { idx[x] = i })

    d.series.forEach(s => {
      const padded: (number|null)[] = xUnion.map(x => {
        const i = idx[x]
        return i === undefined ? null : s.values[i]
      })
      resultSeries.push({ ...s, values: padded })
    })
  })

  return { xValues: xUnion, series: resultSeries }
}

// --- demo data: 3 OIDs with different Xs ---
/**
 * Create a synthetic dataset for an OID with optional phase, jitter and point count.
 *
 * @param oid - identifier for the series
 * @param phase - phase offset applied to the x coordinate (default 0)
 * @param jitter - random jitter amplitude added to y values (default 0.15)
 * @param n - number of points to generate (default 3000)
 * @returns a DataLike object with xValues and a single series of values
 */
export const makeOid = (oid: string, phase = 0, jitter = 0.15, n = 3000) => {
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < n; i++) {
    const x = -15 + i * (30 / n) + (phase ? phase * 0.02 : 0)
    const y = Math.sin(x + phase) + (Math.random() - 0.5) * jitter
    xs.push(x)
    ys.push(y)
  }
  return {
    xValues: xs,
    series: [{
      id: oid,
      formattedId: oid,
      parameter: 'V_vs_U',
      values: ys
    }]
  } as DataLike
}

const d1 = makeOid('rtwb1_06_2020_002', 0)
const d2 = makeOid('rteb1_06_2020_001', 0.6)
const d3 = makeOid('rtwb2_06_2020_001', 1.2)

export const combined = unionPad([d1, d2, d3])
