import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"

/**
 * Returns all status groups of the given version.
 *
 * @returns Status Groups for the given version
 */
export default resolver.pipe(async (versionId: number, ctx: Ctx): Promise<StatusGroup[]> => {
  return await db.statusGroup.findMany({
    where: {
      versionId,
    },
  })
})
