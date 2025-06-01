import {promises} from 'fs'
import {dirname} from 'path'

export async function writeLog(path: string, content: string): Promise<void> {
  const filePath = `logs/${path}`
  await promises.mkdir(dirname(filePath), {recursive: true})
  await promises.writeFile(filePath, content, {encoding: 'utf-8'})
}