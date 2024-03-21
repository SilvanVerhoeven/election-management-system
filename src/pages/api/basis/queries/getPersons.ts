import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Person } from "src/types"
import getPerson from "./getPerson"

/**
 * Returns the latest version of all persons.
 *
 * @returns All Persons
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Person[]> => {
  const dbPersonIds = await db.person.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
    select: { globalId: true },
  })

  return await Promise.all(
    dbPersonIds.map(async (dbPersonId) => getPerson({ globalId: dbPersonId.globalId }, ctx))
  )
})
