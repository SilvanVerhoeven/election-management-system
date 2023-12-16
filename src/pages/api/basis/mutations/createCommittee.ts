import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface CommitteeProps {
  name: string
  shortName?: string
  uploadId: number
}

/**
 * Creates a new committee.
 *
 * @returns Newly created committee in the bare DB form
 */
export default resolver.pipe(async ({ name, shortName, uploadId }: CommitteeProps, ctx: Ctx) => {
  return await db.committee.create({
    data: {
      name,
      shortName: shortName || null,
      version: { connect: { id: uploadId } },
    },
  })
})
