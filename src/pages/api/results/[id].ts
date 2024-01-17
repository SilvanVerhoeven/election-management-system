import mime from "mime"
import { api } from "src/blitz-server"
import { generateResult } from "src/core/lib/result"
import fs from "fs/promises"
import getUpload from "../files/queries/getUpload"
import { getFilePath } from "src/core/lib/files"
import getTemplate from "src/core/queries/getTemplate"
import { templateType } from "src/types"
import { parseCandidatesExcel } from "src/core/lib/candidates"
import getElectionResult from "src/core/queries/getElectionResult"

/**
 * Returns the election result for the given upload.
 */
export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const { id } = req.query

  if (id === undefined || Array.isArray(id)) {
    res.status(404).send({ error: `Upload with ID not found: ${id}` })
    return
  }

  const upload = await getUpload(parseInt(id), ctx)
  const buffer = await fs.readFile(getFilePath(upload))

  const data = await parseCandidatesExcel(buffer)
  const resultData = await getElectionResult(data, ctx)

  const template = await getTemplate(templateType.Results, ctx)
  if (!template) throw new Error("No ballot template set")
  const wordBuffer = await generateResult(resultData, template)

  res.setHeader("content-type", `${mime.getType("docx") || ""}; charset=utf-8`)
  res.setHeader(
    "content-disposition",
    `attachment; filename="stimmzettel-${data.election.committee}_${data.election.statusGroups[0]}"`
  )
  res.setHeader("content-length", `${wordBuffer.byteLength}`)
  res.send(wordBuffer)
})
