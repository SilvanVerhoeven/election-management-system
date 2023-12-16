import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { PollingStation } from "src/types"

export interface FindPollingStationProps {
  nameOrShortName: string
  uploadId: number
}

/**
 * Finds a polling station with the given data.
 *
 * @param nameOrShortName Name or short name of the polling station to find
 * @param uploadId ID of the upload this polling station was imported from
 * @throws NotFoundError if site with these attributes cannot be found
 * @returns Found polling station
 */
export default resolver.pipe(
  async (
    { nameOrShortName, uploadId }: FindPollingStationProps,
    ctx: Ctx
  ): Promise<PollingStation> => {
    return await db.pollingStation.findFirstOrThrow({
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
        locatedAt: true,
      },
    })
  }
)
