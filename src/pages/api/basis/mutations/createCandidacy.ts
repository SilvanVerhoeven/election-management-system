import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateListOrderType } from "src/types"
import getCandidateList from "../queries/getCandidateList"

export interface CandidacyProps {
  listId: number
  candidateId: number
  position?: number
}

/**
 * Adds the given candidate on the given position to the given candidate list.
 */
export default resolver.pipe(
  async ({ listId, candidateId, position }: CandidacyProps, ctx: Ctx) => {
    const list = await getCandidateList({ globalId: listId }, ctx)

    if (list.order === CandidateListOrderType.NUMERIC && position === undefined)
      throw new Error(`Position missing for numerically ordered candidate list ${list.globalId}`)

    await db.candidateListPosition.create({
      data: {
        listId,
        personId: candidateId,
        position,
      },
    })
  }
)
