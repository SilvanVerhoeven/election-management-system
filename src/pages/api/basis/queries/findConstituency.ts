import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"

export interface FindConstituencyProps {
  nameOrShortName: string
  uploadId: number
}

/**
 * Finds a constituency with the given data.
 *
 * @param nameOrShortName Name or short name of the constituency to find
 * @param uploadId ID of the upload this constituency was imported from
 * @throws NotFoundError if constituency with these attributes cannot be found
 * @returns Found constituency
 */
export default resolver.pipe(
  async ({ nameOrShortName, uploadId }: FindConstituencyProps, ctx: Ctx): Promise<Constituency> => {
    return await db.constituency.findFirstOrThrow({
      where: {
        OR: [
          {
            name: nameOrShortName,
          },
          {
            shortName: nameOrShortName,
          },
        ],
        versionId: uploadId,
      },
      include: {
        presenceVotingAt: {
          include: { locatedAt: true },
        },
      },
    })
  }
)
