import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface ElectionProps {
  numberOfSeats: number
  committeeId: number
  eligibleStatusGroupIds: number[]
  eligibleConstituencyIds: number[]
  runsAtId: number
  uploadId: number
}

/**
 * Creates a new election.
 *
 * @returns Newly created election in the bare DB form
 */
export default resolver.pipe(
  async (
    {
      numberOfSeats,
      committeeId,
      eligibleStatusGroupIds,
      eligibleConstituencyIds,
      runsAtId,
      uploadId,
    }: ElectionProps,
    ctx: Ctx
  ) => {
    return await db.election.create({
      data: {
        numberOfSeats,
        committee: {
          connect: { id: committeeId },
        },
        eligibleStatusGroups: {
          connect: eligibleStatusGroupIds.map((id) => {
            return { id }
          }),
        },
        eligibleConstituencies: {
          connect: eligibleConstituencyIds.map((id) => {
            return { id }
          }),
        },
        runsAt: { connect: { id: runsAtId } },
        version: { connect: { id: uploadId } },
      },
    })
  }
)
