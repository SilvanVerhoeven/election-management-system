import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface ConstituencyProps {
  name: string
  shortName?: string
  description?: string
  presenceVotingAtId: number
  uploadId: number
}

/**
 * Creates a new polling station with the given data.
 *
 * @param name Name of the constituency
 * @param shortName Abbreveation of the constituency
 * @param description Description of the constituency
 * @param presenceVotingAtId ID of the polling station at which voters of this constituency can vote in presence
 * @param uploadId ID of the upload data belongs to
 * @returns Newly created constituency in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, description, presenceVotingAtId, uploadId }: ConstituencyProps,
    ctx: Ctx
  ) => {
    return await db.constituency.create({
      data: {
        name,
        shortName: shortName || null,
        description: description || null,
        presenceVotingAt: { connect: { id: presenceVotingAtId } },
        version: { connect: { id: uploadId } },
      },
    })
  }
)
