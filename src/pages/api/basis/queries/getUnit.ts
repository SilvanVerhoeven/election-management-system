import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Faculty, Unit, UnitType } from "src/types"

export interface GetUnitProps {
  globalId: number
  versionId?: number
}

/**
 * Returns unit with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if unit with given properties cannot be found
 * @returns Unit of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetUnitProps, ctx: Ctx): Promise<Faculty | Unit> => {
    const unit = await db.unit.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return {
      ...unit,
      type: unit.type as UnitType,
    }
  }
)
