import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Faculty, UnitType } from "src/types"

export interface GetSubjectProps {
  globalId: number
  versionId?: number
}

/**
 * Returns faculty with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if faculty with given properties cannot be found
 * @returns Faculty of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetSubjectProps, ctx: Ctx): Promise<Faculty> => {
    const faculty = await db.unit.findFirstOrThrow({
      where: {
        type: UnitType.FACULTY,
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return {
      ...faculty,
      type: UnitType.FACULTY,
    }
  }
)
