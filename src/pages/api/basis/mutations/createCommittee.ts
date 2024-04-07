import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Committee as DbCommittee } from "db"
import { ElectionGroupingType } from "src/types"

export interface CommitteeProps {
  name: string
  shortName?: string
  electionsGroupedBy: ElectionGroupingType
  versionId: number
}

/**
 * Creates a new committee, unless it matches another committee completely.
 *
 * @returns Newly created or matching committee in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, electionsGroupedBy, versionId }: CommitteeProps,
    ctx: Ctx
  ): Promise<DbCommittee> => {
    const match = await db.committee.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.electionsGroupedBy == electionsGroupedBy

      if (isCompleteMatch) return match
    }

    const newCommitteeId = match
      ? match.globalId
      : ((await db.committee.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.committee.create({
      data: {
        globalId: newCommitteeId,
        name,
        shortName: shortName || null,
        electionsGroupedBy,
        version: { connect: { id: versionId } },
      },
    })
  }
)
