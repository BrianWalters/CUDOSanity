import {createClient} from '@sanity/client'
import {config} from '@dotenvx/dotenvx'

config({
  path: ['.env.local', '.env']
})

async function init() {
  const client = createClient({
    projectId: 'jlt7jbaf',
    dataset: 'production',
    token: process.env.SANITY_TOKEN!,
    apiVersion: '2025-05-31'
  })


}

init()