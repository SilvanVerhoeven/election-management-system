import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Department, Employment } from "src/types"
import getUnit from "./getUnit"

export type FindEmploymentProps = {
  personId: number
  position: string
  accountingUnitId: string
  versionId?: number
}

/**
 * Finds an employment with the given data.
 *
 * @param personId Global ID of the person with this employment
 * @param position Name of the position the person is employed for
 * @param accountingUnitId ID of the accounting unit the person is employed at
 * @param versionId ID of the wanted version. Defaults to the latest
 * @returns Found Enrolment, null if none can be found
 */
export default resolver.pipe(
  async (
    { personId, accountingUnitId, position, versionId }: FindEmploymentProps,
    ctx: Ctx
  ): Promise<Employment | null> => {
    const dbEmployment = await db.employment.findFirst({
      where: {
        personId,
        accountingUnitId,
        position,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (!dbEmployment) return null

    return {
      ...dbEmployment,
      employedAt: (await getUnit({ globalId: dbEmployment.employedAtId }, ctx)) as Department,
    }
  }
)
