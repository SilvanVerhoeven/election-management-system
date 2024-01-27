import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Election } from "src/types"
import getCommittee from "./getCommittee"
import getConstituenciesForElection from "./getConstituenciesForElection"
import getStatusGroupsForElection from "./getStatusGroupsForElection"

export interface GetElectionProps {
  globalId: number
  versionId?: number
}

/**
 * Returns election with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if election with given properties cannot be found
 * @returns Election of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetElectionProps, ctx: Ctx): Promise<Election> => {
    const dbElection = await db.election.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return {
      ...dbElection,
      committee: await getCommittee({ globalId: dbElection.globalId }, ctx),
      constituencies: await getConstituenciesForElection(dbElection.globalId, ctx),
      statusGroups: await getStatusGroupsForElection(dbElection.globalId, ctx),
    }
  }
)
