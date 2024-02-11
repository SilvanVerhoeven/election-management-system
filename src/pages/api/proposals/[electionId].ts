import mime from "mime"
import { api } from "src/blitz-server"
import getCandidateLists from "../basis/queries/getCandidateLists"
import getElection from "../basis/queries/getElection"
import getTemplate from "src/core/queries/getTemplate"
import { Election, templateType } from "src/types"
import { Ctx } from "blitz"
import { getElectionFileName } from "src/core/lib/files"
import { generateProposal } from "src/core/lib/proposal"
import getElectionSet from "../basis/queries/getElectionSet"

export const getProposalFileName = (election: Election) => {
  return `wahlvorschläge-${getElectionFileName(election)}`
}

export const getProposalFileType = () => "docx"

export const downloadProposal = async (election: Election, ctx: Ctx) => {
  const lists = await getCandidateLists(election.globalId, ctx)
  const electionSet = await getElectionSet({ globalId: election.runsAtId }, ctx)

  const template = await getTemplate(templateType.Proposal, ctx)
  if (!template) throw new Error("No proposal template set")

  return await generateProposal(
    {
      electionSet,
      election,
      lists,
    },
    template
  )
}

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const {
    query: { electionId },
  } = req

  if (typeof electionId !== "string") throw new Error("Election ID must be a string")
  if (isNaN(parseInt(electionId))) throw new Error("Election ID must be an integer")

  try {
    const election = await getElection({ globalId: parseInt(electionId) }, ctx)
    const wordBuffer = await downloadProposal(election, ctx)

    res
      .setHeader("content-type", `${mime.getType(getProposalFileType()) || ""}; charset=utf-8`)
      .setHeader("content-disposition", `attachment; filename="${getProposalFileName(election)}"`)
      .setHeader("content-length", `${wordBuffer.byteLength}`)
      .send(wordBuffer)
  } catch (error) {
    res.status(error.statusCode ?? 500).end(error.message)
  }
})
