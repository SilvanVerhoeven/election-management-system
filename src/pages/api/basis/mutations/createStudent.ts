import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateStatus, Student } from "src/types"
import findStudent from "../queries/findStudent"
import { haveEqualValues } from "src/core/lib/array"
import getStatusGroupsForPerson from "../queries/getStatusGroupsForPerson"
import getFaculty from "../queries/getFaculty"
import getSubjectsForPerson from "../queries/getSubjectsForPerson"

export interface CandidateProps {
  firstName: string
  lastName: string
  statusGroupIds?: number[]
  email?: string
  status?: CandidateStatus
  comment?: string
  electabilityVerifiedOn?: Date
  isElectionHelper?: boolean
  worksAtId?: number
  versionId: number
}

export interface StudentCandidateProps extends CandidateProps {
  matriculationNumber: string
  subjectIds: number[]
  explicitelyVoteAtId?: number
}

const setStatusGroupMembershipsAsDeleted = async (
  personId: number,
  statusGroupIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.statusGroupMembership.findMany({
    where: {
      personId,
      statusGroupId: { notIn: statusGroupIds },
      deleted: false,
    },
  })
  await Promise.all(
    entriesToDelete.map(async (entry) => {
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
}

const createNewStatusGroupMemberships = async (
  personId: number,
  statusGroupIds: number[],
  versionId: number
) => {
  await Promise.all(
    statusGroupIds.map(async (statusGroupId) => {
      await db.statusGroupMembership.upsert({
        where: {
          personId_statusGroupId_deleted: { personId, statusGroupId, deleted: false },
        },
        update: {},
        create: {
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

const setSubjectOccupenciesAsDeleted = async (
  personId: number,
  subjectIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.subjectOccupancy.findMany({
    where: {
      personId,
      subjectId: { notIn: subjectIds },
      deleted: false,
    },
  })
  await Promise.all(
    entriesToDelete.map(async (entry) => {
      await db.subjectOccupancy.create({
        data: {
          personId,
          subjectId: entry.subjectId,
          deleted: true,
          version: { connect: { id: versionId } },
        },
      })
    })
  )
}

const createNewSubjectOccupencies = async (
  personId: number,
  subjectIds: number[],
  versionId: number
) => {
  await Promise.all(
    subjectIds.map(async (subjectId) => {
      await db.subjectOccupancy.upsert({
        where: {
          personId_subjectId_deleted: { personId, subjectId, deleted: false },
        },
        update: {},
        create: {
          personId,
          subjectId,
          deleted: false,
          version: { connect: { id: versionId } },
        },
      })
    })
  )
}

const updateSubjectOccupencies = async (
  personGlobalId: number,
  subjectIds: number[],
  versionId: number
) => {
  await setSubjectOccupenciesAsDeleted(personGlobalId, subjectIds, versionId)
  await createNewSubjectOccupencies(personGlobalId, subjectIds, versionId)
}

const updateReferences = async (
  personGlobalId: number,
  versionId: number,
  subjectIds: number[],
  statusGroupIds: number[]
) =>
  Promise.all([
    updateStatusGroupMemberships(personGlobalId, statusGroupIds, versionId),
    updateSubjectOccupencies(personGlobalId, subjectIds, versionId),
  ])

/**
 * Creates a new student candidate, unless it matches another student candidate completely.
 *
 * @returns Newly created or matching student candidate in the bare DB form
 */
export default resolver.pipe(
  async (
    {
      firstName,
      lastName,
      matriculationNumber,
      subjectIds,
      comment,
      electabilityVerifiedOn,
      email,
      explicitelyVoteAtId,
      isElectionHelper,
      status,
      statusGroupIds = [],
      worksAtId,
      versionId,
    }: StudentCandidateProps,
    ctx: Ctx
  ): Promise<Student> => {
    const match = await findStudent({ matriculationNumber }, ctx)

    const isLocalMatch =
      match &&
      match.firstName == firstName &&
      match.lastName == lastName &&
      match.comment == (comment ?? null) &&
      match.electabilityVerifiedOn == (electabilityVerifiedOn ?? null) &&
      match.email == (email ?? null) &&
      match.explicitelyVoteAtId == (explicitelyVoteAtId ?? null) &&
      match.isElectionHelper == (isElectionHelper ?? null) &&
      match.status == (status ?? null)

    const isReferenceMatch =
      match &&
      haveEqualValues(
        match.statusGroups.map((sg) => sg.globalId),
        statusGroupIds ?? []
      ) &&
      haveEqualValues(
        match.subjects.map((sg) => sg.globalId),
        subjectIds
      )

    if (isLocalMatch && !isReferenceMatch) {
      await updateReferences(match.globalId, versionId, subjectIds, statusGroupIds)
    }

    if (isLocalMatch) return match

    const newStudentId = match
      ? match.globalId
      : ((await db.person.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const newStudent = await db.person.create({
      data: {
        globalId: newStudentId,
        firstName,
        lastName,
        comment,
        electabilityVerifiedOn,
        email,
        explicitelyVoteAtId,
        isElectionHelper,
        matriculationNumber,
        status,
        worksAtId,
        version: { connect: { id: versionId } },
      },
    })

    await updateReferences(newStudent.globalId, versionId, subjectIds, statusGroupIds)

    return {
      ...newStudent,
      statusGroups: await getStatusGroupsForPerson(newStudent.globalId, ctx),
      explicitelyVoteAt: newStudent.explicitelyVoteAtId
        ? await getFaculty({ globalId: newStudent.explicitelyVoteAtId }, ctx)
        : null,
      subjects: await getSubjectsForPerson(newStudent.globalId, ctx),
    }
  }
)
