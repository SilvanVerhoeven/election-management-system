import { templatesDir } from "@/lib/files"
import { TemplateTypes } from "@/lib/types"
import { rm } from "fs/promises"
import { NextResponse } from "next/server"
import { join } from "path"

export async function GET(request: Request, { params }: { params: { templateId: TemplateTypes } }) {
  const templateId = params.templateId
  const uploadDir = join(templatesDir(), templateId)

  try {
    await rm(uploadDir, { recursive: true, force: true })
  } catch {
    return NextResponse.error()
  }

  return NextResponse.json({})
}
