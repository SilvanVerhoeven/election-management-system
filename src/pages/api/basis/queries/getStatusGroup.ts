import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"

export interface GetStatusGroupProps {
  globalId: number
  versionId?: number
}

/**
 * Returns status group with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if status group with given properties cannot be found
 * @returns Status Group of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetStatusGroupProps, ctx: Ctx): Promise<StatusGroup> => {
    return await db.statusGroup.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })
  }
)
