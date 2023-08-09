import { NextRequest } from 'next/server'
import { DonwloadRequestData } from '@/app/count/page'
import { readFile } from 'fs/promises'
import { generateResultHtml, parseResultsFile } from '@/lib/generateResults'
import path from 'path'
import { baseDir } from '@/lib/files'

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
    fileDir
  } = await req.json() as DonwloadRequestData

  const buffer = await readFile(path.join(baseDir(), fileDir, filename))
  const electionData = await parseResultsFile(buffer)

  return new Response(
    generateResultHtml(electionData)
  )
}