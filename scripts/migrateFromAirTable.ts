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

const TeamMember = z.object({
  id: z.string(),
  name: z.string()
})

const TeamMembers = z.array(TeamMember)

const tableUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tblRKvLTa2304dNKv')
const teamMembersUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tblzDAhq2Lk48tJaL')

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

  const teamMembersResponse1 = await fetch(teamMembersUrl, fetchOptions)
  const teamMembersResponseDecoded = await teamMembersResponse1.json()
  teamMembersUrl.searchParams.set('offset', teamMembersResponseDecoded.offset)
  const teamMembersResponse2 = await fetch(teamMembersUrl, fetchOptions)
  const teamMembersResponse2Decoded = await teamMembersResponse2.json()

  const teamMembers = TeamMembers.parse([
    ...teamMembersResponseDecoded.records,
    ...teamMembersResponse2Decoded.records
  ])

  for (let i = 0; i < teamMembers.length; i++) {
    const teamMember = teamMembers[i]
    await client.createIfNotExists({
      _id: teamMember.id,
      _type: SchemaType.TeamMember,
      name: teamMember.name
    })
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
      })),
      teamMembers: record.fields['Team Members'].map(member => ({
        _type: 'reference',
        _ref: member
      }))
    })
  }
}

init()