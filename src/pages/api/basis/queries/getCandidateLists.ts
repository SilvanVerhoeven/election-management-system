import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateList } from "src/types"
import getCandidateList from "./getCandidateList"

/**
 * Returns the latest version of candidate lists for given election.
 * If no election is given (i.e. `null`), all candidate lists are returned (default).
 *
 * @returns All Candidate Lists if `null` was given, candidate lists of the given election otherwise
 */
export default resolver.pipe(
  async (electionId: null | number = null, ctx: Ctx): Promise<CandidateList[]> => {
    const dbLists = await db.candidateList.findMany({
      where: {
        candidatesForId: electionId ?? undefined,
      },
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
  }
)
