import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"
import getPollingStation from "./getPollingStation"

export interface GetConstituencyProps {
  globalId: number
  versionId?: number
}

/**
 * Returns constituency with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if constituency with given properties cannot be found
 * @returns Constituency of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetConstituencyProps, ctx: Ctx): Promise<Constituency> => {
    const dbConstituency = await db.constituency.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const pollingStation = await getPollingStation(
      { globalId: dbConstituency.presenceVotingAtId },
      ctx
    )

    return {
      ...dbConstituency,
      presenceVotingAt: pollingStation,
    }
  }
)
