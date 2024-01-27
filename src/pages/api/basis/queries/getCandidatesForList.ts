import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Candidate } from "src/types"
import getCandidate from "./getCandidate"

/**
 * Returns the latest version of candidates on the candidate list with the given globalId.
 * Candidates are ordered by numeric position if list is numerically ordered or in no particular order.
 *
 * @returns Candidates on the given candidate list
 */
export default resolver.pipe(async (listGlobalId: number, ctx: Ctx): Promise<Candidate[]> => {
  const dbConnections = await db.candidateListPosition.findMany({
    distinct: ["personId"],
    where: {
      listId: listGlobalId,
    },
    orderBy: { position: "asc" },
  })

  return await Promise.all(
    dbConnections.map(
      async (dbConnection) => await getCandidate({ globalId: dbConnection.personId }, ctx)
    )
  )
})
