import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Enrolment, Faculty } from "src/types"
import { haveEqualValues } from "src/core/lib/array"
import findEnrolment from "../queries/findEnrolment"
import getSubjectsForEnrolment from "../queries/getSubjectsForEnrolment"
import getUnit from "../queries/getUnit"

export interface EnrolmentProps {
  personId: number
  matriculationNumber: string
  explicitelyVoteAtId?: number | null
  subjectIds: number[]
  deleted?: boolean
  versionId: number
}

const setSubjectOccupenciesAsDeleted = async (
  enrolmentGlobalId: number,
  subjectIds: number[],
  versionId: number
) => {
  const entriesToDelete = await db.subjectOccupancy.findMany({
    where: {
      enrolmentId: enrolmentGlobalId,
      subjectId: { notIn: subjectIds },
      deleted: false,
    },
  })
  try {
    await Promise.all(
      entriesToDelete.map(async (entry) => {
        await db.subjectOccupancy.create({
          data: {
            enrolmentId: enrolmentGlobalId,
            subjectId: entry.subjectId,
            deleted: true,
            version: { connect: { id: versionId } },
          },
        })
      })
    )
  } catch (error) {
    throw new Error(`DEL ${enrolmentGlobalId} - ${JSON.stringify(subjectIds)} - ${versionId}`)
  }
}

const createNewSubjectOccupencies = async (
  enrolmentGlobalId: number,
  subjectIds: number[],
  versionId: number
) => {
  try {
    await Promise.all(
      subjectIds.map(async (subjectId) => {
        await db.subjectOccupancy.upsert({
          where: {
            enrolmentId_subjectId_deleted: {
              enrolmentId: enrolmentGlobalId,
              subjectId,
              deleted: false,
            },
          },
          update: {},
          create: {
            enrolmentId: enrolmentGlobalId,
            subjectId,
            deleted: false,
            version: { connect: { id: versionId } },
          },
        })
      })
    )
  } catch (error) {
    throw new Error(`NEW ${enrolmentGlobalId} - ${JSON.stringify(subjectIds)} - ${versionId}`)
  }
}

const updateSubjectOccupencies = async (
  enrolmentGlobalId: number,
  subjectIds: number[],
  versionId: number
) => {
  await setSubjectOccupenciesAsDeleted(enrolmentGlobalId, subjectIds, versionId)
  await createNewSubjectOccupencies(enrolmentGlobalId, subjectIds, versionId)
}

const updateReferences = async (personGlobalId: number, versionId: number, subjectIds: number[]) =>
  Promise.all([updateSubjectOccupencies(personGlobalId, subjectIds, versionId)])

/**
 * Creates a new enrolment, unless it matches another enrolment completely.
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
      haveEqualValues(
        match.subjects.map((s) => s.globalId),
        subjectIds ?? []
      )

    if (isLocalMatch && !isReferenceMatch) {
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
