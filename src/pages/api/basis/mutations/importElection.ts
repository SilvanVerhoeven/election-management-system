import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import createSite from "./createSite"
import {
  ParsedCommitteeData,
  ParsedConstituencyData,
  ParsedElectionData,
  ParsedGeneralData,
  ParsedPollingStationData,
  ParsedSiteData,
  ParsedStatusGroupData,
  parseBasisExcel,
} from "src/core/lib/parse/basis"
import createPollingStation from "./createPollingStation"
import findSite from "../queries/findSite"
import findPollingStation from "../queries/findPollingStation"
import createConstituency from "./createConstituency"
import createStatusGroup from "./createStatusGroup"
import createCommittee from "./createCommittee"
import createElection from "./createElection"
import findCommittee from "../queries/findCommittee"
import findStatusGroup from "../queries/findStatusGroup"
import findConstituency from "../queries/findConstituency"
import createElectionSet from "./createElectionSet"
import { Constituency, StatusGroup } from "src/types"
import { ImportResult, importData } from "src/core/lib/import"

const importGeneralData = async (general: ParsedGeneralData, versionId: number, ctx: Ctx) =>
  await createElectionSet(
    {
      name: general.name,
      startDate: general.startDate,
      endDate: general.endDate,
      versionId,
    },
    ctx
  )

const importSites = async (sites: ParsedSiteData[], versionId: number, ctx: Ctx) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const site of sites) {
    await createSite(
      {
        name: site.name,
        shortName: site.shortName,
        description: site.description,
        versionId,
      },
      ctx
    )
    result.success++
  }

  return result
}

const importPollingStations = async (
  pollingStations: ParsedPollingStationData[],
  versionId: number,
  ctx: Ctx
) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const pollingStation of pollingStations) {
    const site = await findSite({ nameOrShortName: pollingStation.siteNameOrShortName }, ctx)
    await createPollingStation(
      {
        name: pollingStation.name,
        shortName: pollingStation.shortName,
        locatedAtId: site.globalId,
        versionId,
      },
      ctx
    )
    result.success++
  }

  return result
}

const importConstituencies = async (
  constituencies: ParsedConstituencyData[],
  versionId: number,
  ctx: Ctx
) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const constituency of constituencies) {
    const pollingStation = await findPollingStation(
      { nameOrShortName: constituency.pollingStationNameOrShortName },
      ctx
    )
    await createConstituency(
      {
        name: constituency.name,
        shortName: constituency.shortName,
        presenceVotingAtId: pollingStation.globalId,
        versionId,
      },
      ctx
    )
    result.success++
  }

  return result
}

const importStatusGroups = async (
  statusGroups: ParsedStatusGroupData[],
  versionId: number,
  ctx: Ctx
) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const statusGroup of statusGroups) {
    await createStatusGroup(
      {
        name: statusGroup.name,
        shortName: statusGroup.shortName,
        priority: statusGroup.priority,
        versionId,
      },
      ctx
    )
    result.success++
  }

  return result
}

const importCommittees = async (committees: ParsedCommitteeData[], versionId: number, ctx: Ctx) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const committee of committees) {
    await createCommittee(
      {
        name: committee.name,
        shortName: committee.shortName,
        versionId,
      },
      ctx
    )
    result.success++
  }

  return result
}

const importElections = async (
  elections: ParsedElectionData[],
  runsAtId: number,
  versionId: number,
  ctx: Ctx
) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const election of elections) {
    const committee = await findCommittee(
      {
        nameOrShortName: election.committeeNameOrShortName,
      },
      ctx
    )

    const statusGroups: StatusGroup[] = []
    for (const nameOrShortName of election.statusGroupNameOrShortNames) {
      statusGroups.push(await findStatusGroup({ nameOrShortName }, ctx))
    }

    const constituencies: Constituency[] = []
    for (const nameOrShortName of election.constituencyNameOrShortNames) {
      constituencies.push(await findConstituency({ nameOrShortName }, ctx))
    }

    await createElection(
      {
        name: election.name,
        committeeId: committee.globalId,
        eligibleStatusGroupIds: Array.from(new Set(statusGroups.map((sg) => sg.globalId))),
        eligibleConstituencyIds: Array.from(new Set(constituencies.map((c) => c.globalId))),
        numberOfSeats: election.numberOfSeats,
        runsAtId,
        versionId,
      },
      ctx
    )

    result.success++
  }

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return await importData(
    uploadId,
    parseBasisExcel,
    async (data, versionId, ctx) => {
      const electionSet = await importGeneralData(data.general, versionId, ctx)
      const results: ImportResult[] = []
      results.push(await importSites(data.sites, versionId, ctx))
      results.push(await importPollingStations(data.pollingStations, versionId, ctx))
      results.push(await importConstituencies(data.constituencies, versionId, ctx))
      results.push(await importStatusGroups(data.statusGroups, versionId, ctx))
      results.push(await importCommittees(data.committees, versionId, ctx))
      results.push(await importElections(data.elections, electionSet.globalId, versionId, ctx))

      return results.reduce(
        (subSum, currResult) => {
          subSum.error.concat(currResult.error)
          subSum.skipped.concat(currResult.skipped)
          subSum.success += currResult.success
          return subSum
        },
        { error: [], skipped: [], success: 0 }
      )
    },
    ctx
  )
})
