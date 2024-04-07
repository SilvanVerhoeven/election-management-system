import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Committee, ElectionGroupingType } from "src/types"

/**
 * Returns the latest version of all committees.
 *
 * @returns All Committees
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Committee[]> => {
  const dbCommittees = await db.committee.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })

  return dbCommittees.map((dbCommittee) => {
    return {
      ...dbCommittee,
      electionsGroupedBy: dbCommittee.electionsGroupedBy as ElectionGroupingType,
    }
  })
})
