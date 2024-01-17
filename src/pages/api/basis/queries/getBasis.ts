import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Basis } from "src/types"
import getLatestElectionSet from "./getLatestElectionSet"
import getSites from "./getSites"
import getElectionsInSet from "./getElectionsInSet"
import getPollingStations from "./getPollingStations"
import getConstituencies from "./getConstituencies"
import getStatusGroups from "./getStatusGroups"
import getCommittees from "./getCommittees"

/**
 * Returns the complete basis data of the latest version of elections.
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Basis | null> => {
  const latestElectionSet = await getLatestElectionSet(null, ctx)
  if (!latestElectionSet) return null
  const basis = {
    general: latestElectionSet,
    sites: await getSites(latestElectionSet.versionId, ctx),
    pollingStations: await getPollingStations(null, ctx),
    constituencies: await getConstituencies(null, ctx),
    statusGroups: await getStatusGroups(null, ctx),
    committees: await getCommittees(null, ctx),
    elections: await getElectionsInSet(latestElectionSet.globalId, ctx),
  }
  return basis
})
