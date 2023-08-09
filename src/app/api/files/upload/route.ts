import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { mkdir, stat } from "fs/promises"
import * as dateFns from 'date-fns'
import {writeFile} from 'fs/promises'
import { baseDir } from '@/lib/files'

export interface DownloadInfo {
  fileDir: string,
  filename: string
}

export async function POST(req: NextRequest) {  
  const data = await req.formData()
  const file = data.get("file")?.valueOf() as File

  const uploadDir = `/uploads/${dateFns.format(Date.now(), "yyyy-MM-dd")}`

  const fullUploadDir = join(
    baseDir(),
    uploadDir
  )
  
  try {
    await stat(fullUploadDir)
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(fullUploadDir, { recursive: true })
    } else {
      console.error(e)
      return NextResponse.error()
    }
  }

  const uniqueSuffix = `${dateFns.format(Date.now(), "yyyy-MM-dd-HHmmss")}_${Math.round(Math.random() * 1e9)}`
  const filename = `${uniqueSuffix}`
  const filePath = join(fullUploadDir, filename)

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))
 
  return NextResponse.json({ fileDir: uploadDir, filename })
}