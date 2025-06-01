import {defineField, defineType} from 'sanity'
import {SchemaType} from '../../consts/SchemaType'

export const seasonSchema = defineType({
  name: SchemaType.Season,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: rule => rule.required(),
      description: 'The name of the season. Something simple like \'Season 1\' is fine.'
    }),
    defineField({
      name: 'year',
      type: 'number'
    })
  ]
})