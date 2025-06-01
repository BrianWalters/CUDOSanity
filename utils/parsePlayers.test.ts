import {expect, test} from 'vitest'
import {parsePlayers} from './parsePlayers'

test('2-6 players', () => {
  expect(parsePlayers('2-6 players')).toStrictEqual({
    min: 2,
    max: 6
  })
})

test('2 players', () => {
  expect(parsePlayers('2 players')).toStrictEqual({
    min: 2,
    max: 2
  })
})

test('up to 5 players', () => {
  expect(parsePlayers('up to 5 players')).toStrictEqual({
    min: 2,
    max: 5
  })
})

test('2-5 players (this is written as "25 players" on the website))', () => {
  expect(parsePlayers('2-5 players (this is written as "25 players" on the website))')).toStrictEqual({
    min: 2,
    max: 5
  })
})