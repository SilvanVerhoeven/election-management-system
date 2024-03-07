import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Employment } from "src/types"
import findEmployment from "../queries/findEmployment"

export interface EmploymentProps {
  personId: number
  position: string
  accountingUnitId: string
  employedAtId: number
  deleted?: boolean
  versionId: number
}

/**
 * Creates a new employment, unless it matches another employment completely.
 *
 * @returns Newly created or matching employment
 */
export default resolver.pipe(
  async (
    { accountingUnitId, employedAtId, deleted, personId, position, versionId }: EmploymentProps,
    ctx: Ctx
  ): Promise<Employment | null> => {
    const match = await findEmployment({ personId, accountingUnitId, position }, ctx)

    const isLocalMatch =
      match &&
      match.personId == personId &&
      match.accountingUnitId == accountingUnitId &&
      match.employedAtId == employedAtId &&
      match.position == position &&
      match.deleted == (deleted ?? false)

    if (isLocalMatch) {
      // Prevent deletion at the end of the import
      await db.employment.update({
        where: { globalId_versionId: { globalId: match.globalId, versionId: match.versionId } },
        data: { versionId },
      })
      return match
    }

    const newEmploymentId = match
      ? match.globalId
      : ((await db.employment.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const newEmployment = await db.employment.create({
      data: {
        globalId: newEmploymentId,
        personId,
        position,
        accountingUnitId,
        employedAtId,
        deleted: deleted ?? false,
        version: { connect: { id: versionId } },
      },
    })

    return newEmployment.deleted ? null : newEmployment
  }
)
