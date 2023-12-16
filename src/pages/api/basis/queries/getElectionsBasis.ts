import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import {
  Committee,
  Constituency,
  Election,
  Elections,
  PollingStation,
  Site,
  StatusGroup,
} from "src/types"
import getLatestElections from "./getLatestVersion"
import getSites from "./getSites"
import getElectionsForBasis from "./getElectionsForBasis"
import getPollingStations from "./getPollingStations"
import getConstituencies from "./getConstituencies"
import getStatusGroups from "./getStatusGroups"
import getCommittees from "./getCommittees"

export type ElectionBasis = {
  general: Elections
  sites: Site[]
  pollingStations: PollingStation[]
  constituencies: Constituency[]
  statusGroups: StatusGroup[]
  committees: Committee[]
  elections: Election[]
}

/**
 * Returns the complete basis data of the latest version of elections.
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<ElectionBasis> => {
  const latestElections = await getLatestElections(null, ctx)
  const basis = {
    general: latestElections,
    sites: await getSites(latestElections.versionId, ctx),
    pollingStations: await getPollingStations(latestElections.versionId, ctx),
    constituencies: await getConstituencies(latestElections.versionId, ctx),
    statusGroups: await getStatusGroups(latestElections.versionId, ctx),
    committees: await getCommittees(latestElections.versionId, ctx),
    elections: await getElectionsForBasis(latestElections.id, ctx),
  }
  return basis
})
