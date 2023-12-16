import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface SiteProps {
  name: string
  shortName?: string
  description?: string
  uploadId: number
}

/**
 * Creates a new site with the given data.
 *
 * @param name Name of the site
 * @param shortName Abbreveation of the site
 * @param uploadId ID of the upload data belongs to
 * @returns Newly created site in the bare DB form
 */
export default resolver.pipe(
  async ({ name, shortName, description, uploadId }: SiteProps, ctx: Ctx) => {
    return await db.site.create({
      data: {
        name,
        shortName: shortName || null,
        description: description || null,
        version: { connect: { id: uploadId } },
      },
    })
  }
)
