import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { ElectionSet } from "src/types"

/**
 * Finds the most recently uploaded election set.
 *
 * @returns Found election set or null, if no election set is given
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<ElectionSet | null> => {
  return await db.electionSet.findFirst({
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })
})
