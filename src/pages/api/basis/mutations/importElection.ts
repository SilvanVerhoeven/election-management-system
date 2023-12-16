import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import getUpload from "../../files/queries/getUpload"
import { getFilePath } from "src/core/lib/files"
import { readFile } from "fs/promises"
import createSite from "./createSite"
import {
  CommitteeData,
  ConstituencyData,
  ElectionData,
  GeneralData,
  PollingStationData,
  SiteData,
  StatusGroupData,
  parseBasisExcel,
} from "src/core/lib/excel/basis"
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
import createElections from "./createElections"

const importGeneralData = async (general: GeneralData, uploadId: number, ctx: Ctx) =>
  await createElections(
    {
      name: general.name,
      startDate: general.startDate,
      endDate: general.endDate,
      uploadId,
    },
    ctx
  )

const importSites = async (sites: SiteData[], uploadId: number, ctx: Ctx) =>
  await Promise.all(
    sites.map(
      async (site) =>
        await createSite(
          {
            name: site.name,
            shortName: site.shortName,
            description: site.description,
            uploadId,
          },
          ctx
        )
    )
  )

const importPollingStations = async (
  pollingStations: PollingStationData[],
  uploadId: number,
  ctx: Ctx
) => {
  await Promise.all(
    pollingStations.map(async (pollingStation) => {
      const site = await findSite(
        { nameOrShortName: pollingStation.siteNameOrShortName, uploadId },
        ctx
      )
      await createPollingStation(
        {
          name: pollingStation.name,
          shortName: pollingStation.shortName,
          locatedAtId: site.id,
          uploadId,
        },
        ctx
      )
    })
  )
}

const importConstituencies = async (
  constituencies: ConstituencyData[],
  uploadId: number,
  ctx: Ctx
) => {
  await Promise.all(
    constituencies.map(async (constituencies) => {
      const pollingStation = await findPollingStation(
        { nameOrShortName: constituencies.pollingStationNameOrShortName, uploadId },
        ctx
      )
      await createConstituency(
        {
          name: constituencies.name,
          shortName: constituencies.shortName,
          presenceVotingAtId: pollingStation.id,
          uploadId,
        },
        ctx
      )
    })
  )
}

const importStatusGroups = async (statusGroups: StatusGroupData[], uploadId: number, ctx: Ctx) => {
  await Promise.all(
    statusGroups.map(
      async (statusGroup) =>
        await createStatusGroup(
          {
            name: statusGroup.name,
            shortName: statusGroup.shortName,
            priority: statusGroup.priority,
            uploadId,
          },
          ctx
        )
    )
  )
}

const importCommittees = async (committees: CommitteeData[], uploadId: number, ctx: Ctx) => {
  await Promise.all(
    committees.map(
      async (committee) =>
        await createCommittee(
          {
            name: committee.name,
            shortName: committee.shortName,
            uploadId,
          },
          ctx
        )
    )
  )
}

const importElections = async (
  elections: ElectionData[],
  runsAtId: number,
  uploadId: number,
  ctx: Ctx
) => {
  await Promise.all(
    elections.map(async (election) => {
      const committee = await findCommittee(
        {
          nameOrShortName: election.committeeNameOrShortName,
          uploadId,
        },
        ctx
      )

      const statusGroups = await Promise.all(
        election.statusGroupNameOrShortNames.map(
          async (nameOrShortName) =>
            await findStatusGroup(
              {
                nameOrShortName,
                uploadId,
              },
              ctx
            )
        )
      )

      const constituencies = await Promise.all(
        election.constituencyNameOrShortNames.map(
          async (nameOrShortName) =>
            await findConstituency(
              {
                nameOrShortName,
                uploadId,
              },
              ctx
            )
        )
      )

      await createElection(
        {
          committeeId: committee.id,
          eligibleStatusGroupIds: statusGroups.map((sg) => sg.id),
          eligibleConstituencyIds: constituencies.map((c) => c.id),
          numberOfSeats: election.numberOfSeats,
          runsAtId,
          uploadId,
        },
        ctx
      )
    })
  )
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  const upload = await getUpload(uploadId, ctx)
  const buffer = await readFile(getFilePath(upload))
  const data = await parseBasisExcel(buffer)

  const elections = await importGeneralData(data.general, uploadId, ctx)
  await importSites(data.sites, uploadId, ctx)
  await importPollingStations(data.pollingStations, uploadId, ctx)
  await importConstituencies(data.constituencies, uploadId, ctx)
  await importStatusGroups(data.statusGroups, uploadId, ctx)
  await importCommittees(data.committees, uploadId, ctx)
  await importElections(data.elections, elections.id, uploadId, ctx)
})
