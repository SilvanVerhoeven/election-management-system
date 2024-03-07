import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Employment } from "src/types"

/**
 * Returns the latest version of employments the person with the given globalId has.
 *
 * @returns Employments of given person
 */
export default resolver.pipe(async (personGlobalId: number, ctx: Ctx): Promise<Employment[]> => {
  const employments = await db.employment.findMany({
    distinct: ["globalId"],
    where: {
      personId: personGlobalId,
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  return employments.filter((employment) => !employment.deleted)
})
