import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"

export interface FindStatusGroupProps {
  nameOrShortName: string
  uploadId: number
}

/**
 * Finds a status group with the given data.
 *
 * @param nameOrShortName Name or short name of the status group to find
 * @param uploadId ID of the upload this status group was imported from
 * @throws NotFoundError if status group with these attributes cannot be found
 * @returns Found status group
 */
export default resolver.pipe(
  async ({ nameOrShortName, uploadId }: FindStatusGroupProps, ctx: Ctx): Promise<StatusGroup> => {
    return await db.statusGroup.findFirstOrThrow({
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
