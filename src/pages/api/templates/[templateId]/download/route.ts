import { templatesDir } from "@/lib/files"
import { TemplateTypes } from "@/lib/types"
import { readFile, stat } from "fs/promises"
import mime from "mime"
import { NextResponse } from "next/server"
import { join } from "path"

export async function GET(request: Request, { params }: { params: { templateId: TemplateTypes } }) {
  const templateId = params.templateId
  const uploadDir = join(templatesDir(), templateId)

  try {
    await stat(uploadDir)
  } catch (e: any) {
    if (e.code === "ENOENT") {
      console.error(e)
      return NextResponse.error()
    }
  }

  const meta = JSON.parse(await readFile(join(uploadDir, "meta.json"), { encoding: "utf-8" }))
  const filePath = join(uploadDir, `${templateId}.${mime.getExtension(meta.type)}`)

  const buffer = await readFile(filePath)

  return new Response(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${meta.filename}"`,
    },
  })
}
