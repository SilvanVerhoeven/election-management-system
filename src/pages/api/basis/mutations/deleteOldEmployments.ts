import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface DeleteEmploymentProps {
  versionId: number
}

/**
 * Deletes all employments that do not have the given version ID.
 *
 * @returns Number of deleted employments
 */
export default resolver.pipe(
  async ({ versionId }: DeleteEmploymentProps, ctx: Ctx): Promise<number> => {
    const employmentsToDelete = (
      await db.employment.findMany({
        distinct: "globalId",
        orderBy: { version: { createdAt: "desc" } },
      })
    ).filter((e) => e.versionId != versionId && !e.deleted)

    const result = await Promise.all(
      employmentsToDelete.map((employment) =>
        db.employment.create({ data: { ...employment, deleted: true, versionId } })
      )
    )

    return result.length
  }
)
