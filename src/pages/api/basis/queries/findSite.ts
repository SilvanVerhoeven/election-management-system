import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Site } from "src/types"

export interface FindSiteProps {
  nameOrShortName: string
  versionId?: number
}

/**
 * Finds a site with the given data.
 *
 * @param nameOrShortName Name or short name of the site to find
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if site with these attributes cannot be found
 * @returns Found site
 */
export default resolver.pipe(
  async ({ nameOrShortName, versionId }: FindSiteProps, ctx: Ctx): Promise<Site> => {
    return await db.site.findFirstOrThrow({
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
  }
)
