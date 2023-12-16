import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Committee } from "src/types"

export interface FindCommitteeProps {
  nameOrShortName: string
  uploadId: number
}

/**
 * Finds a committee with the given data.
 *
 * @param nameOrShortName Name or short name of the committee to find
 * @param uploadId ID of the upload this committee was imported from
 * @throws NotFoundError if committee with these attributes cannot be found
 * @returns Found committee
 */
export default resolver.pipe(
  async ({ nameOrShortName, uploadId }: FindCommitteeProps, ctx: Ctx): Promise<Committee> => {
    return await db.committee.findFirstOrThrow({
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
    })
  }
)
