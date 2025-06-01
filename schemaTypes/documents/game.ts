import {defineArrayMember, defineField, defineType} from 'sanity'
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
    },
    {
      name: 'awards',
      title: 'Awards',
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
      validation: rule => rule.required(),
      fieldset: 'time'
    }),
    defineField({
      name: 'timeUpper',
      title: 'Maximum',
      description: 'Maximum amount of minutes of playtime.',
      type: 'number',
      validation: rule => rule.required(),
      fieldset: 'time'
    }),
    defineField({
      name: 'minimumPlayers',
      title: 'Minimum',
      type: 'number',
      validation: rule => rule.required(),
      fieldset: 'players'
    }),
    defineField({
      name: 'maximumPlayers',
      title: 'Maximum',
      type: 'number',
      validation: rule => rule.required(),
      fieldset: 'players'
    }),
    defineField({
      name: 'summary',
      type: 'text'
    }),
    defineField({
      name: 'teamMembers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {
              type: SchemaType.TeamMember
            }
          ]
        })
      ],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'season',
      type: 'reference',
      to: [
        {
          type: SchemaType.Season
        }
      ],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'awards',
      type: 'array',
      title: 'Won',
      fieldset: 'awards',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {
              type: SchemaType.Award
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'runnerUpAwards',
      type: 'array',
      title: 'Runner-up',
      fieldset: 'awards',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {
              type: SchemaType.Award
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image'
        })
      ]
    }),
    defineField({
      name: 'website',
      type: 'string'
    })
  ]
})