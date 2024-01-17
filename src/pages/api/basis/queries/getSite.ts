import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Site } from "src/types"

export interface GetSiteProps {
  globalId: number
  versionId?: number
}

/**
 * Returns site with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if site with given properties cannot be found
 * @returns Site of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetSiteProps, ctx: Ctx): Promise<Site> => {
    return await db.site.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })
  }
)
