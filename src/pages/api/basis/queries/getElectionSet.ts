import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { ElectionSet } from "src/types"

export interface GetElectionSetProps {
  globalId: number
  versionId?: number
}

/**
 * Returns election set with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if election set with given properties cannot be found
 * @returns Election set of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetElectionSetProps, ctx: Ctx): Promise<ElectionSet> => {
    return await db.electionSet.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })
  }
)
