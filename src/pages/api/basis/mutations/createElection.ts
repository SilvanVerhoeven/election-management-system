import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Election as DbElection } from "db"
import findElection from "../queries/findElection"

export interface ElectionProps {
  name?: string
  numberOfSeats: number
  committeeId: number
  eligibleStatusGroupIds: number[]
  eligibleConstituencyIds: number[]
  runsAtId: number
  versionId: number
}

const setStatusGroupEligibilitiesAsDeleted = async (
  electionId: number,
  eligibleStatusGroupIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.statusGroupEligibility.findMany({
    distinct: ["statusGroupId"],
    where: {
      electionId: electionId,
      statusGroupId: { notIn: eligibleStatusGroupIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  try {
    await Promise.all(
      entriesToDelete
        .filter((entry) => !entry.deleted)
        .map(async (entry) => {
          await db.statusGroupEligibility.create({
            data: {
              electionId,
              statusGroupId: entry.statusGroupId,
              deleted: true,
              version: { connect: { id: versionId } },
            },
          })
        })
    )
  } catch (error) {
    throw new Error(
      `Failed to delete some of the status groups ${JSON.stringify(
        entriesToDelete
      )} from election ${electionId} (status groups: ${JSON.stringify(
        eligibleStatusGroupIds
      )}). Version: ${versionId}. Error: ${error.message}`
    )
  }
}

const createNewStatusGroupEligibilities = async (
  electionId: number,
  eligibleStatusGroupIds: number[],
  versionId: number
) => {
  const currentEntries = await db.statusGroupEligibility.findMany({
    distinct: ["statusGroupId"],
    where: {
      electionId,
      statusGroupId: { in: eligibleStatusGroupIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  const entriesNecessaryToCreate = eligibleStatusGroupIds.filter((statusGroupId) => {
    const match = currentEntries.filter((entry) => entry.statusGroupId == statusGroupId)
    return match.length == 0 || match[0]?.deleted
  })

  await Promise.all(
    entriesNecessaryToCreate.map(async (statusGroupId) => {
      await db.statusGroupEligibility.create({
        data: {
          electionId,
          statusGroupId,
          version: { connect: { id: versionId } },
        },
      })
    })
  )
}

const setConstituencyEligibilitiesAsDeleted = async (
  electionId: number,
  eligibleConstituencyIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.constituencyEligibility.findMany({
    distinct: ["constituencyId"],
    where: {
      electionId,
      constituencyId: { notIn: eligibleConstituencyIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })
  try {
    await Promise.all(
      entriesToDelete
        .filter((entry) => !entry.deleted)
        .map(async (entry) => {
          await db.constituencyEligibility.create({
            data: {
              electionId,
              constituencyId: entry.constituencyId,
              deleted: true,
              version: { connect: { id: versionId } },
            },
          })
        })
    )
  } catch (error) {
    throw new Error(
      `Failed to delete some of the constituencies ${JSON.stringify(
        entriesToDelete
      )} from election ${electionId} (constituencies: ${JSON.stringify(
        eligibleConstituencyIds
      )}). Version: ${versionId}. Error: ${error.message}`
    )
  }
}

const createNewConstituencyEligibilities = async (
  electionId: number,
  eligibleConstituencyIds: number[],
  versionId: number
) => {
  const currentEntries = await db.constituencyEligibility.findMany({
    distinct: ["constituencyId"],
    where: {
      electionId,
      constituencyId: { in: eligibleConstituencyIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  const entriesNecessaryToCreate = eligibleConstituencyIds.filter((constituencyId) => {
    const match = currentEntries.filter((entry) => entry.constituencyId == constituencyId)
    return match.length == 0 || match[0]?.deleted
  })

  await Promise.all(
    entriesNecessaryToCreate.map(async (constituencyId) => {
      await db.constituencyEligibility.create({
        data: {
          electionId,
          constituencyId,
          version: { connect: { id: versionId } },
        },
      })
    })
  )
}

/**
 * Creates a new election, unless it matches another election completely.
 *
 * @returns Newly created or matching election in the bare DB form
 */
export default resolver.pipe(
  async (
    {
      name,
      numberOfSeats,
      committeeId,
      eligibleStatusGroupIds,
      eligibleConstituencyIds,
      runsAtId,
      versionId,
    }: ElectionProps,
    ctx: Ctx
  ): Promise<DbElection> => {
    const match = await findElection(
      {
        name,
        committeeId,
        eligibleConstituencyIds,
        eligibleStatusGroupIds,
        runsAtId,
      },
      ctx
    )

    const isCompleteMatch =
      match &&
      match.committeeId == committeeId &&
      match.name == name &&
      match.numberOfSeats == numberOfSeats

    if (isCompleteMatch) return match

    const newElectionId = match
      ? match.globalId
      : ((await db.election.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const newElection = await db.election.create({
      data: {
        name: name || undefined,
        globalId: newElectionId,
        numberOfSeats,
        committeeId,
        runsAtId,
        version: { connect: { id: versionId } },
      },
    })

    await setStatusGroupEligibilitiesAsDeleted(
      newElection.globalId,
      eligibleStatusGroupIds,
      versionId
    )
    await createNewStatusGroupEligibilities(newElection.globalId, eligibleStatusGroupIds, versionId)
    await setConstituencyEligibilitiesAsDeleted(
      newElection.globalId,
      eligibleConstituencyIds,
      versionId
    )
    await createNewConstituencyEligibilities(
      newElection.globalId,
      eligibleConstituencyIds,
      versionId
    )

    return newElection
  }
)
