import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateStatus, Person } from "src/types"
import { haveEqualValues } from "src/core/lib/array"
import getStatusGroupsForPerson from "../queries/getStatusGroupsForPerson"
import findPerson from "../queries/findPerson"
import findEnrolment from "../queries/findEnrolment"
import getEmploymentsForPerson from "../queries/getEmploymentsForPerson"

export interface PersonProps {
  firstName: string
  lastName: string
  externalId: string
  statusGroupIds?: number[]
  email?: string
  status?: CandidateStatus
  comment?: string
  electabilityVerifiedOn?: Date
  isElectionHelper?: boolean
  versionId: number
}

const setStatusGroupMembershipsAsDeleted = async (
  personId: number,
  statusGroupIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.statusGroupMembership.findMany({
    distinct: ["statusGroupId"],
    where: {
      personId,
      statusGroupId: { notIn: statusGroupIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })
  try {
    await Promise.all(
      entriesToDelete
        .filter((entry) => !entry.deleted)
        .map(async (entry) => {
          await db.statusGroupMembership.create({
            data: {
              personId,
              statusGroupId: entry.statusGroupId,
              deleted: true,
              version: { connect: { id: versionId } },
            },
          })
        })
    )
  } catch (error) {
    throw new Error(
      `Failed to delete some of the status group memberships ${JSON.stringify(
        entriesToDelete
      )} from person ${personId} (status groups: ${JSON.stringify(
        statusGroupIds
      )}). Version: ${versionId}. Error: ${error.message}`
    )
  }
}

const createNewStatusGroupMemberships = async (
  personId: number,
  statusGroupIds: number[],
  versionId: number
) => {
  const currentEntries = await db.statusGroupMembership.findMany({
    distinct: ["statusGroupId"],
    where: {
      personId,
      statusGroupId: { in: statusGroupIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  const entriesNecessaryToCreate = statusGroupIds.filter((statusGroupId) => {
    const match = currentEntries.filter((entry) => entry.statusGroupId == statusGroupId)
    return match.length == 0 || match[0]?.deleted
  })

  await Promise.all(
    entriesNecessaryToCreate.map(async (statusGroupId) => {
      await db.statusGroupMembership.create({
        data: {
          personId,
          statusGroupId,
          deleted: false,
          version: { connect: { id: versionId } },
        },
      })
    })
  )
}

const updateStatusGroupMemberships = async (
  personGlobalId: number,
  statusGroupIds: number[],
  versionId: number
) => {
  await setStatusGroupMembershipsAsDeleted(personGlobalId, statusGroupIds, versionId)
  await createNewStatusGroupMemberships(personGlobalId, statusGroupIds, versionId)
}

const updateReferences = async (
  personGlobalId: number,
  versionId: number,
  statusGroupIds: number[]
) => Promise.all([updateStatusGroupMemberships(personGlobalId, statusGroupIds, versionId)])

const permanentlyDeleteStatusGroupMemberships = async (
  personGlobalId: number,
  versionId: number
) => {
  await db.statusGroupMembership.deleteMany({ where: { personId: personGlobalId, versionId } })
}

const rollbackReferences = async (personGlobalId: number, versionId: number) =>
  permanentlyDeleteStatusGroupMemberships(personGlobalId, versionId)

/**
 * Creates a new person, unless it matches another person completely.
 *
 * @returns Newly created or matching person
 */
export default resolver.pipe(
  async (
    {
      firstName,
      lastName,
      externalId,
      comment,
      electabilityVerifiedOn,
      email,
      isElectionHelper,
      status,
      statusGroupIds = [],
      versionId,
    }: PersonProps,
    ctx: Ctx
  ): Promise<Person> => {
    const match = await findPerson({ externalId }, ctx)

    const isLocalMatch =
      match &&
      match.externalId == externalId &&
      match.firstName == firstName &&
      match.lastName == lastName &&
      match.comment == (comment ?? null) &&
      match.electabilityVerifiedOn == (electabilityVerifiedOn ?? null) &&
      match.email == (email ?? null) &&
      match.isElectionHelper == (isElectionHelper ?? null) &&
      match.status == (status ?? null)

    const isReferenceMatch =
      match &&
      haveEqualValues(
        match.statusGroups.map((sg) => sg.globalId),
        statusGroupIds ?? []
      )

    if (isLocalMatch && !isReferenceMatch) {
      await updateReferences(match.globalId, versionId, statusGroupIds)
    }

    if (isLocalMatch) return match

    const newPersonId = match
      ? match.globalId
      : ((await db.person.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    try {
      const newPerson = await db.person.create({
        data: {
          globalId: newPersonId,
          externalId,
          firstName,
          lastName,
          comment,
          electabilityVerifiedOn,
          email,
          isElectionHelper,
          status,
          version: { connect: { id: versionId } },
        },
      })

      await updateReferences(newPerson.globalId, versionId, statusGroupIds)

      return {
        ...newPerson,
        statusGroups: await getStatusGroupsForPerson(newPerson.globalId, ctx),
        enrolment: await findEnrolment({ personId: newPerson.globalId }, ctx),
        employments: await getEmploymentsForPerson(newPerson.globalId, ctx),
      }
    } catch (error) {
      await rollbackReferences(newPersonId, versionId)
      if ((error.message as string).toLowerCase().includes("unique constraint failed"))
        throw new Error(
          `Person creation failed: External ID '${externalId}' not unique. Error: ${error.toString()}`
        )
      throw error
    }
  }
)
