import {createClient} from '@sanity/client'
import {config} from '@dotenvx/dotenvx'
import {z} from 'zod'
import {SchemaType} from '../consts/SchemaType'
import {fetchAsBuffer} from '../utils/fetchAsBuffer'

config({
  path: ['.env.local']
})

const Record = z.object({
  id: z.string(),
  fields: z.object({
    ID: z.string(),
    Time: z.string(),
    Summary: z.string(),
    'Team Members': z.array(z.string()),
    Season: z.string(),
    Images: z.array(
      z.object({
        url: z.string()
      })
    ).optional(),
    Awards: z.array(
      z.string()
    ).optional(),
    Website: z.string().optional()
  })
})

const Records = z.array(Record)

const tableUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tblRKvLTa2304dNKv')

async function init() {
  const client = createClient({
    projectId: 'jlt7jbaf',
    dataset: 'production',
    token: process.env.SANITY_TOKEN!,
    apiVersion: '2025-05-31',
    useCdn: false
  })

  const fetchOptions = {
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY!}`
    }
  }
  const response1 = await fetch(tableUrl, fetchOptions)

  const decodedResponse = await response1.json()
  tableUrl.searchParams.set('offset', decodedResponse.offset)
  const response2 = await fetch(tableUrl, fetchOptions)
  const decodedResponse2 = await response2.json()

  const records = Records.parse([
    ...decodedResponse.records,
    ...decodedResponse2.records
  ])

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    const imagePromises = (record.fields.Images ?? []).map(image => {
      return fetchAsBuffer(image.url)
        .then(buffer => client.assets.upload('image', buffer))
    })
    const imageDocs = await Promise.all(imagePromises)

    await client.createOrReplace({
      _id: record.id,
      _type: SchemaType.Game,
      name: record.fields.ID,
      summary: record.fields.Summary,
      images: imageDocs.map(doc => ({
        _type: 'reference',
        _ref: doc._id
      }))
    })
  }
}

init()