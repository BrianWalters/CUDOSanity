import {defineField, defineType} from 'sanity'
import {SchemaType} from '../../consts/SchemaType'

export const awardSchema = defineType({
  name: SchemaType.Award,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: rule => rule.required(),
      description: 'The name of the award, i.e. "Replay Value Award."'
    })
  ]
})