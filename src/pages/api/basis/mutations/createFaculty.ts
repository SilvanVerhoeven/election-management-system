import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Faculty, UnitType } from "src/types"

export interface FacultyProps {
  externalId: number
  name: string
  shortName?: string
  description?: string
  associatedWithId?: number
  assignedToId?: number
  versionId: number
}

/**
 * Creates a new faculty, unless it matches another faculty completely.
 *
 * @returns Newly created or matching faculty in the bare DB form
 */
export default resolver.pipe(
  async (
    { externalId, name, shortName, description, versionId }: FacultyProps,
    ctx: Ctx
  ): Promise<Faculty> => {
    const match = await db.unit.findFirst({
      where: {
        type: UnitType.FACULTY,
        externalId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match &&
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.description == (description || null)

      if (isCompleteMatch)
        return {
          ...match,
          type: UnitType.FACULTY,
        }
    }

    const newFacultyId = match
      ? match.globalId
      : ((await db.unit.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const dbFaculty = await db.unit.create({
      data: {
        type: UnitType.FACULTY,
        globalId: newFacultyId,
        externalId,
        name,
        shortName: shortName || null,
        description: description || null,
        assignedToId: -1, // must be done later
        associatedWithId: -1,
        version: { connect: { id: versionId } },
      },
    })

    return {
      ...dbFaculty,
      type: UnitType.FACULTY,
    }
  }
)
