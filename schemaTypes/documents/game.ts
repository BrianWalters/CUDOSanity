import {defineField, defineType} from 'sanity'
import {SchemaType} from '../../consts/SchemaType'

export const gameSchema = defineType({
  name: SchemaType.Game,
  type: "document",
  fields: [
    defineField({
      type: "string",
      name: "name",
      validation: rule => rule.required()
    })
  ]
})