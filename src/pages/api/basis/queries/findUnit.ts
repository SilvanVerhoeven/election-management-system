import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Unit, UnitType } from "src/types"

export interface FindUnitProps {
  externalId: string
  type: UnitType
  versionId?: number
}

/**
 * Finds a unit with the given data.
 *
 * @param externalId ID of the system exporting the units
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if unit with these attributes cannot be found
 * @returns Found unit
 */
export default resolver.pipe(
  async ({ externalId, type, versionId }: FindUnitProps, ctx: Ctx): Promise<Unit> => {
    const dbUnit = await db.unit.findFirstOrThrow({
      where: {
        type,
        externalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return {
      ...dbUnit,
      type: dbUnit.type as UnitType,
    }
  }
)
