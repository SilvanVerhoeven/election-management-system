import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface DeleteCandidacyProps {
  listId: number
  candidateId: number
}

/**
 * Removes the given candidate from the given candidate list.
 */
export default resolver.pipe(async ({ listId, candidateId }: DeleteCandidacyProps, ctx: Ctx) => {
  await db.candidateListPosition.delete({
    where: { personId_listId: { listId, personId: candidateId } },
  })
})
