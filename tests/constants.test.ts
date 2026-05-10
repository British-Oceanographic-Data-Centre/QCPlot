// Some basic, slightly trivial tests to sanity check some constant definitions
import { expect, test } from 'vitest'

import { DEFAULT_COLOURS } from '@/constants'

test('check colours are defined with correct hex format', () => {
  DEFAULT_COLOURS.forEach(colour => {
    expect(colour).toMatch(/#[0-9a-fA-F]{6}/)
  })
})
