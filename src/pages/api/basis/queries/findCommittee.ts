import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Committee, ElectionGroupingType } from "src/types"

export interface FindCommitteeProps {
  nameOrShortName: string
  versionId?: number
}

/**
 * Finds a committee with the given data.
 *
 * @param nameOrShortName Name or short name of the committee to find
 * @param versionId Returns committee of this version, if given. Returns latest version otherwise
 * @throws NotFoundError if committee with these attributes cannot be found
 * @returns Found committee
 */
export default resolver.pipe(
  async ({ nameOrShortName, versionId }: FindCommitteeProps, ctx: Ctx): Promise<Committee> => {
    const dbCommittee = await db.committee.findFirstOrThrow({
      where: {
        OR: [
          {
            name: nameOrShortName,
          },
          {
            shortName: nameOrShortName,
          },
        ],
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
