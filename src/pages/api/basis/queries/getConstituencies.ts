import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"

/**
 * Returns all constituencies of the given version.
 *
 * @returns Constituencies for the given version
 */
export default resolver.pipe(async (versionId: number, ctx: Ctx): Promise<Constituency[]> => {
  return await db.constituency.findMany({
    where: {
      versionId,
    },
    include: { presenceVotingAt: { include: { locatedAt: true } } },
  })
})
