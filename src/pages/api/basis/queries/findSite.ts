import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Site } from "src/types"

export interface FindSiteProps {
  nameOrShortName: string
  uploadId: number
}

/**
 * Finds a site with the given data.
 *
 * @param nameOrShortName Name or short name of the site to find
 * @param uploadId ID of the upload this site was imported from
 * @throws NotFoundError if site with these attributes cannot be found
 * @returns Found site
 */
export default resolver.pipe(
  async ({ nameOrShortName, uploadId }: FindSiteProps, ctx: Ctx): Promise<Site> => {
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
        versionId: uploadId,
      },
    })
  }
)
