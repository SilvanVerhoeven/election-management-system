import { generateWorkbook } from "src/core/lib/excel/basis"
import mime from "mime"
import { api } from "src/blitz-server"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const xlsxBuffer = await generateWorkbook().xlsx.writeBuffer()

  res
    .status(200)
    .setHeader("content-type", `${mime.getType("xlsx") || ""}; charset=utf-8`)
    .setHeader("content-disposition", `attachment; filename="basis"`)
    .send(xlsxBuffer)
})
