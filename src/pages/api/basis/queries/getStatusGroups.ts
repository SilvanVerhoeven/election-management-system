import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"

/**
 * Returns the latest version of all status groups.
 *
 * @returns All Status Groups
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<StatusGroup[]> => {
  return await db.statusGroup.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })
})
