import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Site as DbSite } from "db"

export interface SiteProps {
  name: string
  shortName?: string
  description?: string
  versionId: number
}

/**
 * Creates a new site, unless it matches another site completely.
 *
 * @returns Newly created or matching site in the bare DB form
 */
export default resolver.pipe(
  async ({ name, shortName, description, versionId }: SiteProps, ctx: Ctx): Promise<DbSite> => {
    const match = await db.site.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.description == (description || null)

      if (isCompleteMatch) return match
    }

    const newSiteId = match
      ? match.globalId
      : ((await db.site.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.site.create({
      data: {
        globalId: newSiteId,
        name,
        shortName: shortName || null,
        description: description || null,
        version: { connect: { id: versionId } },
      },
    })
  }
)
