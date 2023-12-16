import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Site } from "src/types"

/**
 * Returns all sites of the given version.
 *
 * @returns Sites for the given version
 */
export default resolver.pipe(async (versionId: number, ctx: Ctx): Promise<Site[]> => {
  return await db.site.findMany({
    where: {
      versionId,
    },
  })
})
