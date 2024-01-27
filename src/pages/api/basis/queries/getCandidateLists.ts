import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateList } from "src/types"
import getCandidateList from "./getCandidateList"

/**
 * Returns the latest version of all candidate lists.
 *
 * @returns All Candidate Lists
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<CandidateList[]> => {
  const dbLists = await db.candidateList.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })

  return await Promise.all(
    dbLists.map(async (dbList) => await getCandidateList({ globalId: dbList.globalId }, ctx))
  )
})
