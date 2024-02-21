import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Unit as DbUnit } from "db"
import { UnitType } from "src/types"

export interface UnitProps {
  type: UnitType
  externalId: number
  name: string
  shortName?: string
  description?: string
  associatedWithId: number // ID of the site this unit is associated with
  assignedToId: number // ID of the constituency this unit is assigned to
  versionId: number
}

/**
 * Creates a new unit (faculty or department), unless it matches another unit completely.
 *
 * @returns Newly created or matching unit in the bare DB form
 */
export default resolver.pipe(
  async (
    {
      type,
      externalId,
      name,
      shortName,
      description,
      associatedWithId,
      assignedToId,
      versionId,
    }: UnitProps,
    ctx: Ctx
  ): Promise<DbUnit> => {
    const match = await db.unit.findFirst({
      where: {
        externalId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch =
        match &&
        match.name == name &&
        match.shortName == (shortName || null) &&
        match.description == (description || null) &&
        match.type == type &&
        match.associatedWithId == associatedWithId &&
        match.assignedToId == assignedToId

      if (isCompleteMatch) return match
    }

    const newUnitId = match
      ? match.globalId
      : ((await db.unit.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.unit.create({
      data: {
        globalId: newUnitId,
        externalId,
        name,
        shortName: shortName || null,
        description: description || null,
        type,
        associatedWithId,
        assignedToId,
        version: { connect: { id: versionId } },
      },
    })
  }
)
