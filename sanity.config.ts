import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './schemaTypes/structure'

export default defineConfig({
  name: 'default',
  title: 'Website',

  projectId: 'jlt7jbaf',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: structure
    }), visionTool()

  ],

  schema: {
    types: schemaTypes
  }
})
