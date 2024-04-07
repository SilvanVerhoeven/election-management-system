import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Committee, ElectionGroupingType } from "src/types"

export interface GetCommitteeProps {
  globalId: number
  versionId?: number
}

/**
 * Returns committee with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if committee with given properties cannot be found
 * @returns Committee of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetCommitteeProps, ctx: Ctx): Promise<Committee> => {
    const dbCommittee = await db.committee.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return {
      ...dbCommittee,
      electionsGroupedBy: dbCommittee.electionsGroupedBy as ElectionGroupingType,
    }
  }
)
