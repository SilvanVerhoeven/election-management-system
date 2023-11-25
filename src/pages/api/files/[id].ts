import { api } from "src/blitz-server"
import fs from "fs/promises"
import getUpload from "./queries/getUpload"
import { getFilePath } from "src/core/lib/files"
import deleteUpload from "./mutations/deleteUpload"

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

  if (req.method === "GET") {
    const upload = await getUpload(parseInt(id), ctx)
    const filePath = getFilePath(upload)
    const buffer = await fs.readFile(filePath)

    res.setHeader("content-disposition", `attachment; filename="${upload.filename}"`)
    res.setHeader("content-length", `${buffer.byteLength}`)
    res.send(buffer)
    return
  }

  if (req.method === "DELETE") {
    try {
      await deleteUpload(parseInt(id), ctx)
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: `Deletion failed` })
      return
    }

    res.status(200).send(null)
    return
  }
})
