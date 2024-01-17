import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Subject as DbSubject } from "db"

export interface SubjectProps {
  name: string
  shortName?: string
  belongsToId: number
  versionId: number
}

/**
 * Creates a new subject, unless it matches another subject completely.
 *
 * @returns Newly created or matching subject in the bare DB form
 */
export default resolver.pipe(
  async (
    { name, shortName, belongsToId, versionId }: SubjectProps,
    ctx: Ctx
  ): Promise<DbSubject> => {
    const match = await db.subject.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.belongsToId == belongsToId

      if (isCompleteMatch) return match
    }

    const newSubjectId = match
      ? match.globalId
      : ((await db.subject.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.subject.create({
      data: {
        globalId: newSubjectId,
        name,
        shortName: shortName || null,
        belongsToId,
        version: { connect: { id: versionId } },
      },
    })
  }
)
