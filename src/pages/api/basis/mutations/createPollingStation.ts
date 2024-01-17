import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { PollingStation as DbPollingStation } from "db"

export interface PollingStationProps {
  name: string
  shortName?: string
  locatedAtId: number
  versionId: number
}

/**
 * Creates a new polling station, unless it matches another election set completely.
 *
 * @returns Newly created polling station in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, locatedAtId, versionId }: PollingStationProps,
    ctx: Ctx
  ): Promise<DbPollingStation> => {
    const match = await db.pollingStation.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.locatedAtId == locatedAtId

      if (isCompleteMatch) return match
    }

    const newPollingStationId = match
      ? match.globalId
      : ((await db.pollingStation.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.pollingStation.create({
      data: {
        globalId: newPollingStationId,
        name,
        shortName: shortName || null,
        locatedAtId,
        version: { connect: { id: versionId } },
      },
    })
  }
)
