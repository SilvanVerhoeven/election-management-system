import { templatesDir } from "@/lib/files"
import { NextRequest, NextResponse } from "next/server"
import fs, { readFile } from 'fs/promises'
import { join } from "path"
import { templateTypes, TemplateTypes } from "@/lib/types"
import PizZip from "pizzip"
import mime from "mime"

export async function GET(req: NextRequest, res: any) {
  const dirPath = templatesDir()
  const templates = await fs.readdir(dirPath) as [TemplateTypes]
  const validTemplates = templates.filter(templateId => Object.values(templateTypes).includes(templateId))
  const templateData: { [key in TemplateTypes]?: {filename: string}} = {}

  const zip = new PizZip()
  
  for (let templateId of validTemplates) {
    const uploadDir = join(dirPath, templateId)
    const metaFilePath = join(uploadDir, 'meta.json')
    const meta = JSON.parse(await readFile(metaFilePath, {encoding: 'utf-8'}))

    const zipDir = zip.folder(templateId)
    zipDir.file(meta.filename, await readFile(join(uploadDir, `${templateId}.${mime.getExtension(meta.type)}`)))
  }

  let blob = zip.generate({type: "blob"})

  return new Response(blob, {
    headers: {
      "content-type": mime.getType("zip") || '',
      "content-disposition": 'attachment; filename="templates.zip"',
    },
  })
}
