import {createClient, SanityImageAssetDocument} from '@sanity/client'
import {config} from '@dotenvx/dotenvx'
import {z} from 'zod'
import {SchemaType} from '../consts/SchemaType'
import {fetchAsBuffer} from '../utils/fetchAsBuffer'
import {parsePlayers} from '../utils/parsePlayers'
import {parseTime} from '../utils/parseTime'

config({
  path: ['.env.local']
})

const Record = z.object({
  id: z.string(),
  fields: z.object({
    ID: z.string(),
    Time: z.string().optional().default('0 minutes'),
    Summary: z.string(),
    'Team Members': z.array(z.string()).optional().default([]),
    Season: z.string(),
    Images: z.array(
      z.object({
        url: z.string()
      })
    ).optional(),
    Awards: z.array(
      z.string()
    ).optional().default([]),
    'Runner Up': z.array(
      z.string()
    ).optional().default([]),
    Website: z.string().optional(),
    Players: z.string().optional().default('0 players')
  })
})

const Records = z.array(Record)

const IdAndName = z.object({
  id: z.string(),
  fields: z.object({
    Name: z.string()
  })
})

const IdAndNames = z.array(IdAndName)

const tableUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tblRKvLTa2304dNKv')
const teamMembersUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tblzDAhq2Lk48tJaL')
const awardsUrl = new URL('https://api.airtable.com/v0/appDXLyohviLJSUNM/tbl81y62r3f7poEJ3')

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

  const teamMembers = IdAndNames.parse([
    ...teamMembersResponseDecoded.records,
    ...teamMembersResponse2Decoded.records
  ])

  for (let i = 0; i < teamMembers.length; i++) {
    const teamMember = teamMembers[i]
    const name = teamMember.fields.Name
    await client.createOrReplace({
      _id: teamMember.id,
      _type: SchemaType.TeamMember,
      name: teamMember.fields.Name
    })
    console.log(`> Created team member ${name}.`)
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

  const awardResponse = await fetch(awardsUrl, fetchOptions)
  const decodedAwards = await awardResponse.json()
  const awardsFromAirTable = IdAndNames.parse(decodedAwards.records)

  const awards = await client.fetch('*[_type == $awardType]{ _id }', {
    awardType: SchemaType.Award
  }) ?? []

  const seasons = await client.fetch('*[_type == $season]{ _id }', {
    season: SchemaType.Season
  })

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    const imagePromises = (record.fields.Images ?? []).map(async image => {
      try {
        const buffer = await fetchAsBuffer(image.url)
        const doc = await client.assets.upload('image', buffer)
        return [doc]
      } catch {
        console.log(`>! Error uploading image: ${image.url}.`)
        return []
      }
    })
    const imageDocs: SanityImageAssetDocument[] = (await Promise.all(imagePromises)).flat()

    const players = parsePlayers(record.fields.Players)
    const playtime = parseTime(record.fields.Time, players)

    const name = record.fields.ID

    const seasonId = makeSeasonId(record.fields.Season)
    const seasonAdded = seasons.findIndex((s: any) => s._id === seasonId) > -1
    if (!seasonAdded) {
      await client.createIfNotExists({
        _id: seasonId,
        _type: SchemaType.Season,
        name: record.fields.Season
      })
      console.log(`> Created season ${seasonId}.`)
    }

    function resolveAwardReferencesFor(awardIds: string[]) {
      return Promise.all(
        awardIds.map(awardId => {
          if (awards.includes(awardId)) {
            return {
              _key: crypto.randomUUID(),
              _type: 'reference',
              _ref: awardId
            }
          }

          const awardFromAirTable = awardsFromAirTable.find(afat => afat.id === awardId)

          if (!awardFromAirTable) throw new Error(`Award ${awardId} not found.`)

          return client.createIfNotExists({
            _type: SchemaType.Award,
            _id: awardFromAirTable.id,
            name: awardFromAirTable.fields.Name
          }).then(awardDoc => {
            return {
              _key: crypto.randomUUID(),
              _type: 'reference',
              _ref: awardDoc._id
            }
          })
        })
      )
    }

    const awardReferences = await resolveAwardReferencesFor(record.fields.Awards)
    const runnerUpReferences = await resolveAwardReferencesFor(record.fields['Runner Up'])

    await client.createOrReplace({
      _id: record.id,
      _type: SchemaType.Game,
      name,
      summary: record.fields.Summary,
      images: imageDocs.map(imageAssetDoc => ({
        _key: crypto.randomUUID(),
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetDoc._id
        }
      })),
      teamMembers: record.fields['Team Members'].map(member => ({
        _key: crypto.randomUUID(),
        _type: 'reference',
        _ref: member
      })),
      minimumPlayers: players.min,
      maximumPlayers: players.max,
      timeLower: playtime.lower,
      timeUpper: playtime.upper,
      season: {
        _type: 'reference',
        _ref: seasonId
      },
      awards: awardReferences,
      runnerUpAwards: runnerUpReferences
    })

    console.log(`> Created game ${name}.`)
  }
}

function makeSeasonId(seasonName: string) {
  return seasonName.toLowerCase().replaceAll(' ', '')
}

init()