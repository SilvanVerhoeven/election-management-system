import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface StatusGroupProps {
  name: string
  shortName?: string
  priority: number
  uploadId: number
}

/**
 * Creates a new status group with the given data.
 *
 * @param name Name of the status group
 * @param shortName Abbreveation of the status group
 * @param priority By default, a candidate with multiple status groups is counted as part of the status group with the lowest number
 * @param uploadId ID of the upload data belongs to
 * @returns Newly created status group in the bare DB form
 */
export default resolver.pipe(
  async ({ name, shortName, priority, uploadId }: StatusGroupProps, ctx: Ctx) => {
    return await db.statusGroup.create({
      data: {
        name,
        shortName: shortName || null,
        priority,
        version: { connect: { id: uploadId } },
      },
    })
  }
)
