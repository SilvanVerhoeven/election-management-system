import mime from "mime"
import { api } from "src/blitz-server"
import getCandidateLists from "../basis/queries/getCandidateLists"
import getElection from "../basis/queries/getElection"
import getTemplate from "src/core/queries/getTemplate"
import { Election, templateType } from "src/types"
import { generateBallot } from "src/core/lib/ballot"
import { Ctx } from "blitz"
import { getElectionFileName } from "src/core/lib/files"
import getElectionSet from "../basis/queries/getElectionSet"

export const getBallotFileName = (election: Election) => {
  return `stimmzettel-${getElectionFileName(election)}`
}

export const getBallotFileType = () => "docx"

export const downloadBallot = async (election: Election, ctx: Ctx) => {
  const lists = await getCandidateLists(election.globalId, ctx)
  const electionSet = await getElectionSet({ globalId: election.runsAtId }, ctx)

  const template = await getTemplate(templateType.Ballot, ctx)
  if (!template) throw new Error("No ballot template set")

  return await generateBallot(
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
    const wordBuffer = await downloadBallot(election, ctx)

    res
      .setHeader("content-type", `${mime.getType(getBallotFileType()) || ""}; charset=utf-8`)
      .setHeader("content-disposition", `attachment; filename="${getBallotFileName(election)}"`)
      .setHeader("content-length", `${wordBuffer.byteLength}`)
      .send(wordBuffer)
  } catch (error) {
    res.status(error.statusCode ?? 500).end(error.message)
  }
})
