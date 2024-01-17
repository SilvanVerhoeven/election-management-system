import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { ElectionSet as DbElectionSet } from "db"
import getLatestElectionSet from "../queries/getLatestElectionSet"

export interface ElectionProps {
  name: string
  startDate: Date
  endDate: Date
  versionId: number
}

/**
 * Creates a new election set, unless it matches another election set completely.
 *
 * @returns Newly created or matching election set in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, startDate, endDate, versionId }: ElectionProps,
    ctx: Ctx
  ): Promise<DbElectionSet> => {
    const match = await db.electionSet.findFirst({
      where: {
        OR: [{ name }, { startDate, endDate }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.startDate.getTime() == startDate.getTime() &&
        match.endDate.getTime() == endDate.getTime()

      if (isCompleteMatch) return match
    }

    const newElectionSetId = match
      ? match.globalId
      : ((await getLatestElectionSet(null, ctx))?.globalId ?? 0) + 1

    return await db.electionSet.create({
      data: {
        globalId: newElectionSetId,
        name,
        startDate,
        endDate,
        version: { connect: { id: versionId } },
      },
    })
  }
)
