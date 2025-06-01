export function parseTime(time: string, players?: {min: number, max: number}): {lower: number, upper: number} {
  if (time.search('per player') > -1) {
    if (!players) {
      throw new Error('players arg is required for per player time.')
    }

    const perPlayer = parseInt(time)
    return {
      lower: perPlayer * players.min,
      upper: perPlayer * players.max
    }
  }

  if (time.search('-') > -1) {
    const split = time.split('-')
    return {
      lower: parseInt(split[0]),
      upper: parseInt(split[1])
    }
  }

  const minutes = parseInt(time)

  return {
    upper: minutes,
    lower: minutes
  }
}