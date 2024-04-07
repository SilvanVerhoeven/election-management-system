import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Election } from "src/types"
import db from "db"
import getElection from "./getElection"

interface GetElectionForCommitteeProps {
  committeeId: number
  electionSetId: number
}

/**
 * Returns all elections for the given data.
 *
 * @returns Elections for the given committee within the given election set
 */
export default resolver.pipe(
  async (
    { committeeId, electionSetId }: GetElectionForCommitteeProps,
    ctx: Ctx
  ): Promise<Election[]> => {
    const electionIds = await db.election.findMany({
      where: {
        committeeId,
        runsAtId: electionSetId,
      },
      select: { globalId: true },
    })

    return await Promise.all(electionIds.map(({ globalId }) => getElection({ globalId }, ctx)))
  }
)
