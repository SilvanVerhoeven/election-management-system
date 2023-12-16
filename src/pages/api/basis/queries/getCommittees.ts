import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Committee } from "src/types"

/**
 * Returns all committees of the given version.
 *
 * @returns Committees for the given version
 */
export default resolver.pipe(async (versionId: number, ctx: Ctx): Promise<Committee[]> => {
  return await db.committee.findMany({
    where: {
      versionId,
    },
  })
})
