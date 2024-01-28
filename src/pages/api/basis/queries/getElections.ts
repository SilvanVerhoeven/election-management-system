import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Election } from "src/types"
import getLatestElectionSet from "./getLatestElectionSet"
import getElectionsInSet from "./getElectionsInSet"

/**
 * Returns all elections of the latest election set.
 * If no election set is defined, an empty array is returned
 *
 * @returns Elections running at the most recent election set
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Election[]> => {
  const electionSet = await getLatestElectionSet(null, ctx)
  return !electionSet ? [] : getElectionsInSet(electionSet.globalId, ctx)
})
