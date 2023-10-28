import { templatesDir } from "@/lib/files"
import { NextRequest, NextResponse } from "next/server"
import fs, { readFile } from "fs/promises"
import { join } from "path"
import { templateTypes, TemplateTypes } from "@/lib/types"

export async function GET(req: NextRequest) {
  const dirPath = templatesDir()
  const templates = (await fs.readdir(dirPath)) as [TemplateTypes]
  const validTemplates = templates.filter((templateId) =>
    Object.values(templateTypes).includes(templateId)
  )
  const templateData: { [key in TemplateTypes]?: { filename: string } } = {}

  for (let templateId of validTemplates) {
    const uploadDir = join(dirPath, templateId)
    const metaFilePath = join(uploadDir, "meta.json")
    const meta = JSON.parse(await readFile(metaFilePath, { encoding: "utf-8" }))
    const data = {
      filename: meta.filename,
    }
    templateData[templateId] = data
  }

  return NextResponse.json(templateData)
}
