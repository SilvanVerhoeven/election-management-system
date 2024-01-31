import mime from "mime"
import { api } from "src/blitz-server"
import getElections from "../basis/queries/getElections"
import { zippify } from "src/core/lib/files"
import { downloadProposal, getProposalFileName, getProposalFileType } from "./[electionId]"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const elections = await getElections(null, ctx)
  const proposals = await Promise.all(
    elections.map(async (election) => await downloadProposal(election, ctx))
  )

  const zip = zippify(
    elections,
    proposals,
    (election) => `${getProposalFileName(election)}.${getProposalFileType()}`
  )

  const now = new Date()
  const dateTimeString = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

  res
    .setHeader("content-disposition", `attachment; filename="wahlvorschläge-${dateTimeString}.zip"`)
    .setHeader("content-type", mime.getType("zip") || "")
    .send(zip)
})
