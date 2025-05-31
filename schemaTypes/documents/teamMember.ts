import {defineField, defineType} from 'sanity'
import {SchemaType} from '../../consts/SchemaType'

export const teamMemberSchema = defineType({
  name: SchemaType.TeamMember,
  type: 'document',
  fields: [
    defineField({
      type: 'string',
      name: 'name',
      validation: rule => rule.required()
    })
  ]
})