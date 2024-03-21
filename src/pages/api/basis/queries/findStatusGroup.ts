import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"

export type FindStatusGroupProps = (
  | {
      nameOrShortName: string
    }
  | {
      position: string
    }
) & {
  versionId?: number
}

/**
 * Finds a status group with the given data.
 *
 * @param nameOrShortName Name or short name of the status group to find
 * @param position Position of an employee that should be mapped to a status group
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if status group with these attributes cannot be found
 * @returns Found status group
 */
export default resolver.pipe(
  async ({ versionId, ...identifier }: FindStatusGroupProps, ctx: Ctx): Promise<StatusGroup> => {
    if ("position" in identifier) {
      const mapping = await db.positionStatusGroupMap.findFirst({
        where: { position: identifier.position },
      })

      if (!mapping)
        throw new Error(`Position ${identifier.position} cannot be mapped to status group`)
      if (!mapping.statusGroupId)
        throw new Error(`Position ${identifier.position} was not assigned to a status group`)

      return await db.statusGroup.findFirstOrThrow({
        where: {
          globalId: mapping.statusGroupId,
          versionId,
        },
        orderBy: { version: { createdAt: "desc" } },
      })
    }

    return await db.statusGroup.findFirstOrThrow({
      where: {
        OR: [
          {
            name: identifier.nameOrShortName,
          },
          {
            shortName: identifier.nameOrShortName,
          },
        ],
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })
  }
)
