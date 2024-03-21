import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { PositionStatusGroupMap as DbPositionStatusGroupMap } from "db"
import findStatusGroup from "../queries/findStatusGroup"

export interface PositionMapProps {
  position: string
  statusGroupNameOrShortName: string
}

/**
 * Creates a new mapping from position to status group, unless it already exists.
 *
 * @throws NotFoundError if not status group with the given name or short name can be found
 * @returns Newly created or matching mapping in bare DB form
 */
export default resolver.pipe(
  async (
    { position, statusGroupNameOrShortName }: PositionMapProps,
    ctx: Ctx
  ): Promise<DbPositionStatusGroupMap> => {
    const statusGroup =
      statusGroupNameOrShortName == ""
        ? null
        : await findStatusGroup({ nameOrShortName: statusGroupNameOrShortName }, ctx)

    return await db.positionStatusGroupMap.upsert({
      where: { position },
      update: { statusGroupId: !!statusGroup ? statusGroup.globalId : null },
      create: { position, statusGroupId: !!statusGroup ? statusGroup.globalId : null },
    })
  }
)
