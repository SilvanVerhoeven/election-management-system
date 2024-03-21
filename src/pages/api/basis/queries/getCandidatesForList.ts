import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import getPerson from "./getPerson"
import { Person } from "src/types"

/**
 * Returns the latest version of candidates on the candidate list with the given globalId.
 * Candidates are ordered by numeric position if list is numerically ordered or in no particular order.
 *
 * @returns Candidates on the given candidate list
 */
export default resolver.pipe(async (listGlobalId: number, ctx: Ctx): Promise<Person[]> => {
  const dbConnections = await db.candidateListPosition.findMany({
    distinct: ["personId"],
    where: {
      listId: listGlobalId,
    },
    orderBy: { position: "asc" },
  })

  return await Promise.all(
    dbConnections.map(
      async (dbConnection) => await getPerson({ globalId: dbConnection.personId }, ctx)
    )
  )
})
