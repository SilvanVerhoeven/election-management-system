import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { mkdir, stat } from "fs/promises"
import {writeFile} from 'fs/promises'
import { templatesDir } from '@/lib/files'
import mime from 'mime'

export interface DownloadInfo {
  fileDir: string,
  filename: string
}

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const file = data.get("file")?.valueOf() as File
  const templateId = data.get("templateId")?.valueOf() as string
  
  const uploadDir = join(templatesDir(), templateId)

  try {
    await stat(uploadDir)
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true })
    } else {
      console.error(e)
      return NextResponse.error()
    }
  }

  const filePath = join(uploadDir, `${templateId}.${mime.getExtension(file.type) || ''}`) 
  const metaFilePath = join(uploadDir, 'meta.json')

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))
  await writeFile(metaFilePath, JSON.stringify({
    templateId,
    filename: file.name,
    size: file.size,
    type: file.type
  }))
  
 
  return NextResponse.json({ fileDir: uploadDir, templateId })
}