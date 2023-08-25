import { NextRequest } from 'next/server'
import { DonwloadRequestData } from '@/app/results/page'
import { readFile } from 'fs/promises'
import { generateResultWord, parseResultsFile } from '@/lib/generateResults'
import path from 'path'
import { filesDir } from '@/lib/files'
import mime from 'mime'

/**
 * SECURITY RISK
 * 
 * Because there is no database to access, we rely on the filename and fileDir passed by the user to read in the proper file.
 * As of writing this comment, the server is intended for local deployment only.
 * Once the server should be deployed elsewhere, a secure measure to access result files should be used.
 */

export async function POST(req: NextRequest) {
  const {
    filename,
    fileDir: dateDir
  } = await req.json() as DonwloadRequestData

  const buffer = await readFile(path.join(filesDir(), dateDir, filename))
  const electionData = await parseResultsFile(buffer)
  const wordBuffer = await generateResultWord(electionData)

  return new Response(wordBuffer, {
    headers: {
      "content-type": `${(mime.getType("docx") || '')}; charset=utf-8`,
      "content-disposition": `attachment; filename="ergebnis-${electionData.committee}_${electionData.statusGroup}"`,
      "content-length": `${wordBuffer.byteLength}`
    },
  })
}