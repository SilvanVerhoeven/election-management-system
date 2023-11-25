import { readFile } from "fs/promises"
import PizZip from "pizzip"
import mime from "mime"
import { api } from "src/blitz-server"
import getTemplates from "src/core/queries/getTemplates"
import { getFilePath } from "src/core/lib/files"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const templates = await getTemplates(true, ctx)

  const zip = new PizZip()

  for (const template of templates) {
    const zipDir = zip.folder(template.id)
    if (!!template.upload) {
      console.log(template.id)
      zipDir.file(template.upload?.filename, await readFile(getFilePath(template.upload)))
    }
  }

  let blob = zip.generate({ type: "nodebuffer" })

  res.setHeader("content-disposition", 'attachment; filename="templates.zip"')
  res.setHeader("content-type", mime.getType("zip") || "")
  return res.send(blob)
})
