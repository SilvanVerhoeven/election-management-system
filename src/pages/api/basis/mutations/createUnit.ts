import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Unit, UnitType } from "src/types"

export interface UnitProps {
  type: UnitType
  externalId: string
  name: string
  shortName?: string
  description?: string
  associatedWithId?: number
  assignedToId?: number
  versionId: number
}

/**
 * Creates a new unit, unless it matches another unit completely.
 *
 * @returns Newly created or matching unit in the bare DB form
 */
export default resolver.pipe(
  async (
    { type, externalId, name, shortName, description, versionId }: UnitProps,
    ctx: Ctx
  ): Promise<Unit> => {
    const match = await db.unit.findFirst({
      where: {
        type,
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
          type,
        }
    }

    const newUnitId = match
      ? match.globalId
      : ((await db.unit.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const dbUnit = await db.unit.create({
      data: {
        type,
        globalId: newUnitId,
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
      ...dbUnit,
      type,
    }
  }
)
