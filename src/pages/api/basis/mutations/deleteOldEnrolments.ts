import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export interface DeleteEnrolmentProps {
  versionId: number
}

/**
 * Deletes all enrolments that do not have the given version ID.
 *
 * @returns Number of deleted enrolments
 */
export default resolver.pipe(
  async ({ versionId }: DeleteEnrolmentProps, ctx: Ctx): Promise<number> => {
    const enrolmentsToDelete = (
      await db.enrolment.findMany({
        distinct: "globalId",
        orderBy: { version: { createdAt: "desc" } },
      })
    ).filter((e) => e.versionId != versionId && !e.deleted)

    const result = await Promise.all(
      enrolmentsToDelete.map((enrolment) =>
        db.enrolment.create({ data: { ...enrolment, deleted: true, versionId } })
      )
    )

    return result.length
  }
)
