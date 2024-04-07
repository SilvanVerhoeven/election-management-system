import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { CandidateList as CandidateList } from "db"
import { CandidateListOrderType } from "src/types"

export interface CandidateListProps {
  name: string
  shortName?: string
  order: CandidateListOrderType
  submittedOn: Date
  candidatesForId: number
  rank?: number
  versionId: number
}

/**
 * Creates a new candidate list including.
 *
 * @returns Newly created candidate list in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, order, submittedOn, candidatesForId, rank, versionId }: CandidateListProps,
    ctx: Ctx
  ): Promise<CandidateList> => {
    const newListId =
      ((await db.candidateList.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.candidateList.create({
      data: {
        globalId: newListId,
        name,
        shortName: shortName || null,
        order,
        candidatesForId,
        submittedOn,
        rank: rank || null,
        version: { connect: { id: versionId } },
      },
    })
  }
)
