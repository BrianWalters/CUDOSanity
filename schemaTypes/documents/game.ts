import {defineField, defineType} from 'sanity'
import {SchemaType} from '../../consts/SchemaType'

export const gameSchema = defineType({
  name: SchemaType.Game,
  type: 'document',
  fieldsets: [
    {
      name: 'time',
      title: 'Time',
      options: {
        columns: 2
      }
    },
    {
      name: 'players',
      title: 'Players',
      options: {
        columns: 2
      }
    }
  ],
  fields: [
    defineField({
      type: 'string',
      name: 'name',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'timeLower',
      title: 'Minimum',
      description: 'Minimum amount of minutes of playtime.',
      type: 'number',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'timeUpper',
      title: 'Maximum',
      description: 'Maximum amount of minutes of playtime.',
      type: 'number',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'minimumPlayers',
      title: 'Minimum',
      type: 'number',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'maximumPlayers',
      title: 'Maximum',
      type: 'number',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'summary',
      type: 'text'
    })
  ]
})