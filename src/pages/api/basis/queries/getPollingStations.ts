import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { PollingStation } from "src/types"

/**
 * Returns all polling stations of the given version.
 *
 * @returns Polling Stations for the given version
 */
export default resolver.pipe(async (versionId: number, ctx: Ctx): Promise<PollingStation[]> => {
  return await db.pollingStation.findMany({
    where: {
      versionId,
    },
    include: { locatedAt: true },
  })
})
