import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import getUpload from "../../files/queries/getUpload"
import { getFilePath } from "src/core/lib/files"
import { readFile } from "fs/promises"
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
import createVersion from "./createVersion"
import { Constituency, StatusGroup } from "src/types"

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
  }
}

const importPollingStations = async (
  pollingStations: ParsedPollingStationData[],
  versionId: number,
  ctx: Ctx
) => {
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
  }
}

const importConstituencies = async (
  constituencies: ParsedConstituencyData[],
  versionId: number,
  ctx: Ctx
) => {
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
  }
}

const importStatusGroups = async (
  statusGroups: ParsedStatusGroupData[],
  versionId: number,
  ctx: Ctx
) => {
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
  }
}

const importCommittees = async (committees: ParsedCommitteeData[], versionId: number, ctx: Ctx) => {
  for (const committee of committees) {
    await createCommittee(
      {
        name: committee.name,
        shortName: committee.shortName,
        versionId,
      },
      ctx
    )
  }
}

const importElections = async (
  elections: ParsedElectionData[],
  runsAtId: number,
  versionId: number,
  ctx: Ctx
) => {
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
        committeeId: committee.globalId,
        eligibleStatusGroupIds: Array.from(new Set(statusGroups.map((sg) => sg.globalId))),
        eligibleConstituencyIds: Array.from(new Set(constituencies.map((c) => c.globalId))),
        numberOfSeats: election.numberOfSeats,
        runsAtId,
        versionId,
      },
      ctx
    )
  }
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  const upload = await getUpload(uploadId, ctx)
  const buffer = await readFile(getFilePath(upload))
  const data = await parseBasisExcel(buffer)

  const version = await createVersion({ uploadId: upload.id }, ctx)

  const electionSet = await importGeneralData(data.general, version.id, ctx)
  await importSites(data.sites, version.id, ctx)
  await importPollingStations(data.pollingStations, version.id, ctx)
  await importConstituencies(data.constituencies, version.id, ctx)
  await importStatusGroups(data.statusGroups, version.id, ctx)
  await importCommittees(data.committees, version.id, ctx)
  await importElections(data.elections, electionSet.globalId, version.id, ctx)
})
