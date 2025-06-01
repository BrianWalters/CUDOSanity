export function parsePlayers(players: string): {min: number; max: number;} {
  if (players.toLowerCase().startsWith('up to ')) {
    const max = parseInt(players.slice(6))
    return {
      min: 2,
      max
    }
  }

  if (players.search('-') === -1) {
    const numberOfPlayers = parseInt(players)
    return {
      min: numberOfPlayers,
      max: numberOfPlayers
    }
  }

  const split = players.split('-')


  return {
    min: parseInt(split[0]),
    max: parseInt(split[1])
  }
}