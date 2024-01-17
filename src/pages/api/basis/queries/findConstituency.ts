import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"
import getPollingStation from "./getPollingStation"

export interface FindConstituencyProps {
  nameOrShortName: string
  versionId?: number
}

/**
 * Finds a constituency with the given data.
 *
 * @param nameOrShortName Name or short name of the constituency to find
 * @param versionId Returns committee of this version, if given. Returns latest version otherwise
 * @throws NotFoundError if constituency with these attributes cannot be found
 * @returns Found constituency
 */
export default resolver.pipe(
  async (
    { nameOrShortName, versionId }: FindConstituencyProps,
    ctx: Ctx
  ): Promise<Constituency> => {
    const dbConstituency = await db.constituency.findFirstOrThrow({
      where: {
        OR: [
          {
            name: nameOrShortName,
          },
          {
            shortName: nameOrShortName,
          },
        ],
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
