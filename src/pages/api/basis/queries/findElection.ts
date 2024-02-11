import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Election as DbElection } from "db"
import getStatusGroupsForElection from "./getStatusGroupsForElection"
import getConstituenciesForElection from "./getConstituenciesForElection"
import { haveEqualValues } from "src/core/lib/array"

export interface FindElectionProps {
  name?: string
  committeeId: number
  runsAtId: number
  eligibleStatusGroupIds: number[]
  eligibleConstituencyIds: number[]
}

/**
 * Finds election with the given data.
 *
 * @returns Matching Election in bare DB form or null
 */
export default resolver.pipe(
  async (
    {
      name,
      committeeId,
      runsAtId,
      eligibleConstituencyIds,
      eligibleStatusGroupIds,
    }: FindElectionProps,
    ctx: Ctx
  ): Promise<DbElection | null> => {
    const possibleMatches = await db.election.findMany({
      where: {
        OR: [
          {
            committeeId,
            runsAtId,
          },
          !!name ? { name, runsAtId } : {},
        ],
      },
      distinct: ["globalId"],
      orderBy: { version: { createdAt: "desc" } },
    })

    for (const possibleMatch of possibleMatches) {
      const eligibleStatusGroups = await getStatusGroupsForElection(possibleMatch.globalId, ctx)
      const eligibleConstituencies = await getConstituenciesForElection(possibleMatch.globalId, ctx)

      const isRelationMatch =
        haveEqualValues(
          eligibleConstituencies.map((c) => c.globalId),
          eligibleConstituencyIds
        ) &&
        haveEqualValues(
          eligibleStatusGroups.map((sg) => sg.globalId),
          eligibleStatusGroupIds
        )

      if (isRelationMatch) return possibleMatch
    }

    return null
  }
)
