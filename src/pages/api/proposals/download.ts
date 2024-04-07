import mime from "mime"
import { api } from "src/blitz-server"
import { zippify } from "src/core/lib/files"
import { downloadProposal, getProposalFileName, getProposalFileType } from "./[committeeId]"
import getProposalsData from "./queries/getProposalsData"

export default api(async (req, res, ctx) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const proposalData = await getProposalsData(null, ctx)
  const proposals = await Promise.all(
    proposalData.map(
      async (data) => await downloadProposal(data.committee, data.constituencies ?? [], ctx)
    )
  )

  const zip = zippify(
    proposalData,
    proposals,
    (data) => `${getProposalFileName(data)}.${getProposalFileType()}`
  )

  const now = new Date()
  const dateTimeString = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

  res
    .setHeader("content-disposition", `attachment; filename="wahlvorschläge-${dateTimeString}.zip"`)
    .setHeader("content-type", mime.getType("zip") || "")
    .send(zip)
})
