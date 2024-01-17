import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { StatusGroup as DbStatusGroup } from "db"

export interface StatusGroupProps {
  name: string
  shortName?: string
  priority: number // By default, a candidate with multiple status groups is counted as part of the status group with the lowest number
  versionId: number
}

/**
 * Creates a new status group with the given data, unless it matches another status group completely.
 *
 * @returns Newly created or matching status group in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, priority, versionId }: StatusGroupProps,
    ctx: Ctx
  ): Promise<DbStatusGroup> => {
    const match = await db.statusGroup.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name && match.shortName == (shortName || null) && match.priority == priority

      if (isCompleteMatch) return match
    }

    const newStatusGroupId = match
      ? match.globalId
      : ((await db.statusGroup.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.statusGroup.create({
      data: {
        globalId: newStatusGroupId,
        name,
        shortName: shortName || null,
        priority,
        version: { connect: { id: versionId } },
      },
    })
  }
)
