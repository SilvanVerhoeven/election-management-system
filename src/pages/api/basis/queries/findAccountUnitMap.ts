import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { AccountUnitMap } from "src/types"

export interface FindMappedUnitProps {
  accountingUnitId: string
}

/**
 * Returns account unit map for the given accounting unit ID.
 *
 * @returns AccountUnitMap or null, if map cannot be found
 */
export default resolver.pipe(
  async ({ accountingUnitId }: FindMappedUnitProps, ctx: Ctx): Promise<AccountUnitMap | null> => {
    return await db.accountUnitMap.findFirst({
      where: {
        accountingUnitId,
      },
    })
  }
)
