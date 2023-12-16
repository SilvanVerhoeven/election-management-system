import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface PollingStationProps {
  name: string
  shortName?: string
  locatedAtId: number
  uploadId: number
}

/**
 * Creates a new polling station with the given data.
 *
 * @param name Name of the polling station
 * @param shortName Abbreveation of the polling station
 * @param locatedAtId ID of the site this polling station is located at
 * @param uploadId ID of the upload data belongs to
 * @returns Newly created polling station in the bare DB form
 */
export default resolver.pipe(
  async ({ name, shortName, locatedAtId, uploadId }: PollingStationProps, ctx: Ctx) => {
    return await db.pollingStation.create({
      data: {
        name,
        shortName: shortName || null,
        locatedAt: { connect: { id: locatedAtId } },
        version: { connect: { id: uploadId } },
      },
    })
  }
)
