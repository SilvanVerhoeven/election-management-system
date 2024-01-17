import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Election as DbElection } from "db"
import findElection from "../queries/findElection"

export interface ElectionProps {
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
    where: {
      electionId,
      statusGroupId: { notIn: eligibleStatusGroupIds },
    },
  })
  await Promise.all(
    entriesToDelete.map(async (entry) => {
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
}

const createNewStatusGroupEligibilities = async (
  electionId: number,
  eligibleStatusGroupIds: number[],
  versionId: number
) => {
  await Promise.all(
    eligibleStatusGroupIds.map(async (statusGroupId) => {
      await db.statusGroupEligibility.upsert({
        where: {
          electionId_statusGroupId_versionId: { electionId, statusGroupId, versionId },
        },
        update: {},
        create: {
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
    where: {
      electionId,
      constituencyId: { notIn: eligibleConstituencyIds },
    },
  })
  await Promise.all(
    entriesToDelete.map(
      async (entry) =>
        await db.constituencyEligibility.create({
          data: {
            electionId,
            constituencyId: entry.constituencyId,
            deleted: true,
            version: { connect: { id: versionId } },
          },
        })
    )
  )
}

const createNewConstituencyEligibilities = async (
  electionId: number,
  eligibleConstituencyIds: number[],
  versionId: number
) => {
  await Promise.all(
    eligibleConstituencyIds.map(
      async (constituencyId) =>
        await db.constituencyEligibility.upsert({
          where: {
            electionId_constituencyId_versionId: { electionId, constituencyId, versionId },
          },
          update: {},
          create: {
            electionId,
            constituencyId,
            version: { connect: { id: versionId } },
          },
        })
    )
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
        committeeId,
        eligibleConstituencyIds,
        eligibleStatusGroupIds,
        runsAtId,
      },
      ctx
    )

    const isCompleteMatch = match && match.numberOfSeats == numberOfSeats

    if (isCompleteMatch) return match

    const newElectionId = match
      ? match.globalId
      : ((await db.election.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const newElection = await db.election.create({
      data: {
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
