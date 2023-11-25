import { api } from "src/blitz-server"
import { _Ballot } from "src/core/lib/ballot"
import fs, { rm } from "fs/promises"
import getUpload from "./queries/getUpload"
import { getFilePath } from "src/core/lib/files"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET" && req.method !== "DELETE") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const { id } = req.query

  if (id === undefined || Array.isArray(id)) {
    res.status(404).send({ error: `Upload with ID not found: ${id}` })
    return
  }

  const upload = await getUpload(parseInt(id), ctx)
  const filePath = getFilePath(upload)

  if (req.method === "GET") {
    const buffer = await fs.readFile(filePath)

    res.setHeader("content-disposition", `attachment; filename="${upload.filename}"`)
    res.setHeader("content-length", `${buffer.byteLength}`)
    res.send(buffer)
    return
  }

  if (req.method === "DELETE") {
    try {
      await rm(filePath, { recursive: true, force: true })
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: `Deletion failed` })
      return
    }

    res.status(200).send(null)
    return
  }
})
