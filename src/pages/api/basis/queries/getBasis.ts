import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Basis } from "src/types"
import getLatestElectionSet from "./getLatestElectionSet"
import getSites from "./getSites"
import getElectionsForBasis from "./getElectionsInSet"
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
    pollingStations: await getPollingStations(latestElectionSet.versionId, ctx),
    constituencies: await getConstituencies(latestElectionSet.versionId, ctx),
    statusGroups: await getStatusGroups(latestElectionSet.versionId, ctx),
    committees: await getCommittees(latestElectionSet.versionId, ctx),
    elections: await getElectionsForBasis(latestElectionSet.id, ctx),
  }
  return basis
})
