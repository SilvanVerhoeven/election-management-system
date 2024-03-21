import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Department, Employment } from "src/types"
import getUnit from "./getUnit"

/**
 * Returns the latest version of employments the person with the given globalId has.
 *
 * @returns Employments of given person
 */
export default resolver.pipe(async (personGlobalId: number, ctx: Ctx): Promise<Employment[]> => {
  const dbEmployments = await db.employment.findMany({
    distinct: ["globalId"],
    where: {
      personId: personGlobalId,
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  const employments = await Promise.all(
    dbEmployments.map(async (employment) => {
      return {
        ...employment,
        employedAt: (await getUnit({ globalId: employment.employedAtId }, ctx)) as Department,
      }
    })
  )

  return employments.filter((employment) => !employment.deleted)
})
