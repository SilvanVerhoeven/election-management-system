import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import getCandidateList from "../queries/getCandidateList"
import deleteCandidacy from "./deleteCandidacy"

export interface DeleteCandidateListProps {
  globalId: number
  versionId?: number
}

/**
 * Deletes the candidate list with the given ID (all versions). Deletes only specific version if `versionId` is given.
 */
export default resolver.pipe(
  async ({ globalId, versionId }: DeleteCandidateListProps, ctx: Ctx) => {
    const list = await getCandidateList({ globalId, versionId }, ctx)

    await Promise.all(
      list.candidates.map((candidate) =>
        deleteCandidacy({ listId: globalId, candidateId: candidate.globalId }, ctx)
      )
    )

    await db.candidateList.deleteMany({
      where: {
        globalId,
        versionId,
      },
    })
  }
)
