import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import createCandidacy from "./createCandidacy"
import { CandidateListOrderType } from "src/types"
import getCandidateList from "../queries/getCandidateList"
import deleteCandidacy from "./deleteCandidacy"

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
    const list = await getCandidateList({ globalId: listId }, ctx)

    const currentCandidateIds = list.candidates.map((candidate) => candidate.globalId)
    const candidateToDeleteIds = currentCandidateIds.filter((id) => !candidateIds.includes(id))

    await Promise.all(
      candidateToDeleteIds.map((candidateId) => deleteCandidacy({ listId, candidateId }, ctx))
    )

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
