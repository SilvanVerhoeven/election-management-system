import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateStatus, Student } from "src/types"
import findStudent from "../queries/findStudent"
import { haveEqualValues } from "src/core/lib/array"
import getStatusGroupsForPerson from "../queries/getStatusGroupsForPerson"
import getSubject from "../queries/getSubject"
import getFaculty from "../queries/getFaculty"

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
  subjectId: number
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
      subjectId,
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
      match.subjectId == subjectId &&
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
      )

    if (isLocalMatch && !isReferenceMatch) {
      await updateStatusGroupMemberships(match.globalId, statusGroupIds, versionId)
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
        matriculationNumber: newStudentId.toString(), // Mockup until we have proper matriculation numbers
        status,
        subjectId,
        worksAtId,
        version: { connect: { id: versionId } },
      },
    })

    await updateStatusGroupMemberships(newStudent.globalId, statusGroupIds, versionId)

    return {
      ...newStudent,
      statusGroups: await getStatusGroupsForPerson(newStudent.globalId, ctx),
      explicitelyVoteAt: newStudent.explicitelyVoteAtId
        ? await getFaculty({ globalId: newStudent.explicitelyVoteAtId }, ctx)
        : null,
      subject: newStudent.subjectId
        ? await getSubject({ globalId: newStudent.subjectId }, ctx)
        : null,
    }
  }
)
