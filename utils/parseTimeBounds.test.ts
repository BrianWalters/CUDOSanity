import {expect, test} from 'vitest'
import {parseTime} from './parseTime'

test('20 minutes', () => {
  expect(parseTime('20 minutes')).toStrictEqual({
    upper: 20,
    lower: 20
  })
})

test('20-30 minutes', () => {
  expect(parseTime('20-30 minutes')).toStrictEqual({
    lower: 20,
    upper: 30
  })
})

test('20 minutes per player', () => {
  expect(parseTime('20 minutes per player', {max: 4, min: 2})).toStrictEqual({
    lower: 40,
    upper: 80
  })
})