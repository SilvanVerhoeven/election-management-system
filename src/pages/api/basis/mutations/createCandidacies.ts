import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import createCandidacy from "./createCandidacy"
import { CandidateListOrderType } from "src/types"

export interface CandidaciesProps {
  listId: number
  candidateIds: number[]
  order?: CandidateListOrderType
}

/**
 * Makes given persons candidates on the given list in the given order.
 */
export default resolver.pipe(
  async ({ listId, candidateIds, order }: CandidaciesProps, ctx: Ctx) => {
    let position = 0
    for (const candidateId of candidateIds) {
      await createCandidacy(
        {
          listId,
          candidateId,
          position: order == CandidateListOrderType.ALPHABETICALLY ? undefined : position,
        },
        ctx
      )
      position++
    }
  }
)
