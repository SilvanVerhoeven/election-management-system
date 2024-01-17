import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Constituency as DbConstituency } from "db"

export interface ConstituencyProps {
  name: string
  shortName?: string
  description?: string
  presenceVotingAtId: number
  versionId: number
}

/**
 * Creates a new constituency, unless it matches another constituency completely.
 *
 * @returns Newly created or matching constituency in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, description, presenceVotingAtId, versionId }: ConstituencyProps,
    ctx: Ctx
  ): Promise<DbConstituency> => {
    const match = await db.constituency.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.description == (description || null) &&
        match.presenceVotingAtId == presenceVotingAtId

      if (isCompleteMatch) return match
    }

    const newConstituencyId = match
      ? match.globalId
      : ((await db.constituency.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.constituency.create({
      data: {
        globalId: newConstituencyId,
        name,
        shortName: shortName || null,
        description: description || null,
        presenceVotingAtId,
        version: { connect: { id: versionId } },
      },
    })
  }
)
