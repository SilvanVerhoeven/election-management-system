import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Enrolment, Faculty, SubjectOccupancy } from "src/types"
import { areIdentical } from "src/core/lib/array"
import findEnrolment from "../queries/findEnrolment"
import getSubjectsForEnrolment from "../queries/getSubjectsForEnrolment"
import getUnit from "../queries/getUnit"

export interface EnrolmentProps {
  personId: number
  matriculationNumber: string
  explicitelyVoteAtId?: number | null
  subjectIds: number[] // assumption: order in subject priority
  deleted?: boolean
  versionId: number
}

const setSubjectOccupenciesAsDeleted = async (
  enrolmentGlobalId: number,
  newSubjectIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.subjectOccupancy.findMany({
    distinct: ["subjectId"],
    where: {
      enrolmentId: enrolmentGlobalId,
      subjectId: { notIn: newSubjectIds },
    },
    orderBy: { version: { createdAt: "desc" } },
  })
  try {
    await Promise.all(
      entriesToDelete
        .filter((entry) => !entry.deleted)
        .map(async (occupency) => {
          await db.subjectOccupancy.create({
            data: {
              enrolmentId: enrolmentGlobalId,
              subjectId: occupency.subjectId,
              priority: occupency.priority,
              deleted: true,
              version: { connect: { id: versionId } },
            },
          })
        })
    )
  } catch (error) {
    throw new Error(
      `Failed to delete some of the subjects ${JSON.stringify(
        entriesToDelete
      )} from enrolment ${enrolmentGlobalId} (subjects: ${JSON.stringify(
        newSubjectIds
      )}). Version: ${versionId}. Error: ${error.message}`
    )
  }
}

const createNewSubjectOccupencies = async (
  enrolmentGlobalId: number,
  currentOccupencies: SubjectOccupancy[],
  newSubjectIds: number[],
  versionId: number
) => {
  const entriesNecessaryToCreate = newSubjectIds
    .map((subjectId, priority) => {
      return {
        subjectId,
        priority,
      }
    })
    .filter(
      (entry) =>
        currentOccupencies.findIndex(
          (co) => co.subjectId == entry.subjectId && co.priority == entry.priority
        ) == -1
    )

  try {
    await Promise.all(
      entriesNecessaryToCreate.map(async (entry) => {
        await db.subjectOccupancy.create({
          data: {
            enrolmentId: enrolmentGlobalId,
            subjectId: entry.subjectId,
            priority: entry.priority,
            deleted: false,
            version: { connect: { id: versionId } },
          },
        })
      })
    )
  } catch (error) {
    throw new Error(
      `Failed to create some of the subjects ${JSON.stringify(
        entriesNecessaryToCreate
      )} for enrolment ${enrolmentGlobalId} (subjects: ${JSON.stringify(
        newSubjectIds
      )}). Version: ${versionId}. Error: ${error.message}`
    )
  }
}

const updateSubjectOccupencies = async (
  enrolmentGlobalId: number,
  newSubjectIds: number[],
  versionId: number
) => {
  const currentOccupencies = (
    await db.subjectOccupancy.findMany({
      distinct: ["subjectId"],
      where: { enrolmentId: enrolmentGlobalId },
      orderBy: { version: { createdAt: "desc" } },
    })
  ).filter((occupency) => !occupency.deleted)

  await setSubjectOccupenciesAsDeleted(enrolmentGlobalId, newSubjectIds, versionId)
  await createNewSubjectOccupencies(enrolmentGlobalId, currentOccupencies, newSubjectIds, versionId)
}

const updateReferences = async (
  enrolmentGlobalId: number,
  versionId: number,
  newSubjectIds: number[]
) => Promise.all([updateSubjectOccupencies(enrolmentGlobalId, newSubjectIds, versionId)])

/**
 * Creates a new enrolment, unless it matches another enrolment completely.
 *
 * @param subjecIds Must be ordered in subject priority (first is most important)
 *
 * @returns Newly created or matching enrolment
 */
export default resolver.pipe(
  async (
    {
      deleted,
      explicitelyVoteAtId,
      matriculationNumber,
      personId,
      subjectIds,
      versionId,
    }: EnrolmentProps,
    ctx: Ctx
  ): Promise<Enrolment | null> => {
    const match = await findEnrolment({ personId }, ctx)

    const isLocalMatch =
      match &&
      match.personId == personId &&
      match.matriculationNumber == matriculationNumber &&
      match.deleted == (deleted ?? false) &&
      match.explicitelyVoteAtId == (explicitelyVoteAtId ?? null)

    const isReferenceMatch =
      match &&
      areIdentical(
        match.subjects.map((s) => s.globalId),
        subjectIds ?? []
      )

    if (isLocalMatch && !match.deleted && !isReferenceMatch) {
      await updateReferences(match.globalId, versionId, subjectIds)
    }

    if (isLocalMatch) {
      // Prevent deletion at the end of the import
      await db.enrolment.update({
        where: { globalId_versionId: { globalId: match.globalId, versionId: match.versionId } },
        data: { versionId },
      })
      return match
    }

    const newEnrolmentId = match
      ? match.globalId
      : ((await db.enrolment.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    const newEnrolment = await db.enrolment.create({
      data: {
        globalId: newEnrolmentId,
        matriculationNumber,
        deleted: deleted ?? false,
        personId,
        explicitelyVoteAtId,
        version: { connect: { id: versionId } },
      },
    })

    await updateReferences(newEnrolment.globalId, versionId, subjectIds)

    if (newEnrolment.deleted) return null

    return {
      ...newEnrolment,
      subjects: await getSubjectsForEnrolment(newEnrolment.globalId, ctx),
      explicitelyVoteAt: newEnrolment.explicitelyVoteAtId
        ? ((await getUnit({ globalId: newEnrolment.explicitelyVoteAtId }, ctx)) as Faculty)
        : null,
    }
  }
)
