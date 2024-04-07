import mime from "mime"
import { api } from "src/blitz-server"
import getCandidateLists from "../basis/queries/getCandidateLists"
import getTemplate from "src/core/queries/getTemplate"
import {
  CandidateList,
  Committee,
  Constituency,
  Election,
  ElectionGroupingType,
  templateType,
} from "src/types"
import { Ctx } from "blitz"
import { getCommitteeFileName, getConstituenciesFileName } from "src/core/lib/files"
import { generateProposal } from "src/core/lib/proposal"
import getCommittee from "../basis/queries/getCommittee"
import getLatestElectionSet from "../basis/queries/getLatestElectionSet"
import getElectionsForCommittee from "../basis/queries/getElectionsForCommittee"
import getConstituency from "../basis/queries/getConstituency"
import { haveEqualValues } from "src/core/lib/array"
import { ProposalData } from "./queries/getProposalsData"

export const getProposalFileName = (data: ProposalData) => {
  return `wahlvorschläge-${
    !data.constituencies || data.constituencies.length == 0
      ? getCommitteeFileName(data.committee)
      : `${getCommitteeFileName(data.committee)}-${getConstituenciesFileName(data.constituencies)}`
  }`
}

export const getProposalFileType = () => "docx"

export const downloadProposal = async (
  committee: Committee,
  constituencies: Constituency[],
  ctx: Ctx
) => {
  const electionSet = await getLatestElectionSet(null, ctx)
  if (!electionSet) throw new Error("No election set available")

  const template = await getTemplate(templateType.Proposal, ctx)
  if (!template) throw new Error("No proposal template set")

  let elections: Election[] = []
  let lists: CandidateList[] = []

  if (committee.electionsGroupedBy == ElectionGroupingType.COMMITTEE) {
    elections = await getElectionsForCommittee(
      { committeeId: committee.globalId, electionSetId: electionSet.globalId },
      ctx
    )
  } else if (committee.electionsGroupedBy == ElectionGroupingType.COMMITTEE_CONSTITUENCY) {
    elections = (
      await getElectionsForCommittee(
        { committeeId: committee.globalId, electionSetId: electionSet.globalId },
        ctx
      )
    ).filter((election) => haveEqualValues(constituencies, election.constituencies))
  } else if (committee.electionsGroupedBy == ElectionGroupingType.COMMITTEE_STATUSGROUP) {
    elections = await getElectionsForCommittee(
      { committeeId: committee.globalId, electionSetId: electionSet.globalId },
      ctx
    )
  }

  lists = (
    await Promise.all(elections.map((election) => getCandidateLists(election.globalId, ctx)))
  ).flat()

  return await generateProposal(
    {
      electionSet,
      committee,
      electionsGroupedBy: committee.electionsGroupedBy,
      elections,
      lists,
    },
    template
  )
}

export default api(async (req, res, ctx) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const {
    query: { committeeId },
    body: constituencyIds,
  } = req

  try {
    if (constituencyIds.some((cId) => isNaN(parseInt(cId))))
      throw new Error(
        `Constituency IDs must be an array of numbers, got ${JSON.stringify(constituencyIds)}`
      )
    if (typeof committeeId !== "string")
      throw new Error(`Comittee ID must be a number string, got ${typeof committeeId}`)
    if (isNaN(parseInt(committeeId))) throw new Error("Committee ID must be an integer")

    const committee = await getCommittee({ globalId: parseInt(committeeId) }, ctx)
    const constituencies = await Promise.all(
      constituencyIds.map((constituencyId) => getConstituency({ globalId: constituencyId }, ctx))
    )
    const wordBuffer = await downloadProposal(committee, constituencies, ctx)

    res
      .setHeader("content-type", `${mime.getType(getProposalFileType()) || ""}; charset=utf-8`)
      .setHeader(
        "content-disposition",
        `attachment; filename="${getProposalFileName({ committee, constituencies })}"`
      )
      .setHeader("content-length", `${wordBuffer.byteLength}`)
      .send(wordBuffer)
  } catch (error) {
    res.status(error.statusCode ?? 500).end(error.message)
  }
})
