import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Elections } from "src/types"

/**
 * Finds the most recently uploaded elections collection.
 *
 * @throws NotFoundError if there is no elections collection
 * @returns Found elections collection
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Elections> => {
  return await db.elections.findFirstOrThrow({
    orderBy: {
      version: {
        uploadedAt: "desc",
      },
    },
  })
})
