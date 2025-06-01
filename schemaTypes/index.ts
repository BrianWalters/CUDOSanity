import {gameSchema} from './documents/game'
import {teamMemberSchema} from './documents/teamMember'
import {awardSchema} from './documents/award'
import {seasonSchema} from './documents/season'

export const schemaTypes = [
  gameSchema,
  teamMemberSchema,
  awardSchema,
  seasonSchema
]
