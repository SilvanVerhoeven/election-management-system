import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface ElectionProps {
  name: string
  startDate: Date
  endDate: Date
  uploadId: number
}

/**
 * Creates a new elections collection.
 *
 * @returns Newly created elections collection in the bare DB form
 */
export default resolver.pipe(
  async ({ name, startDate, endDate, uploadId }: ElectionProps, ctx: Ctx) => {
    return await db.elections.create({
      data: {
        name,
        startDate,
        endDate,
        version: { connect: { id: uploadId } },
      },
    })
  }
)
