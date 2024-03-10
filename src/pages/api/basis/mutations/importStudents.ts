import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import findStatusGroup from "../queries/findStatusGroup"
import { ParsedStudentData, parseStudentsXLSX } from "src/core/lib/parse/persons"
import createStudent from "./createStudent"
import findSubject from "../queries/findSubject"
import { ImportResult, importData, returnNullOnError } from "src/core/lib/import"
import { Subject } from "src/types"
import deleteOldEnrolments from "./deleteOldEnrolments"

const importStudents = async (students: ParsedStudentData[], versionId: number, ctx: Ctx) => {
  const studentStatusGroup = await findStatusGroup(
    { nameOrShortName: process.env.STATUS_GROUP_NAME_STUDENTS ?? "" },
    ctx
  )

  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const student of students) {
    // const faculty = await findUnit({ externalId: student.explicitelyVoteAtFacultyId }, ctx)
    const subjects = await Promise.all(
      student.subjectsShortName.map(async (shortName, index) => {
        return {
          priority: index,
          subject: await returnNullOnError(() => findSubject({ shortName }, ctx)),
        }
      })
    )

    subjects.sort((a, b) => a.priority - b.priority) // ensure correct priority order

    if (subjects.findIndex((subject) => subject === null) > -1) {
      result.skipped.push({
        label: `[SKIP] ${student.firstName} ${student.lastName} (${student.matriculationNumber})`,
        error: `No subject(s) found with ID(s) ${subjects
          .map((subject, index) =>
            subject === null ? `'${student.subjectsShortName[index]}'` : null
          )
          .filter((output) => output === null)
          .join(", ")}`,
      })
      continue
    }

    try {
      await createStudent(
        {
          externalId: student.externalId,
          firstName: student.firstName,
          lastName: student.lastName,
          matriculationNumber: student.matriculationNumber,
          subjectIds: (subjects.map((entry) => entry.subject) as Subject[]).map(
            (subject) => subject.globalId
          ),
          statusGroupIds: [studentStatusGroup.globalId],
          // explicitelyVoteAtId: student.explicitelyVoteAtFacultyId // Maybe use later (or not at all)
          versionId,
        },
        ctx
      )

      result.success++
    } catch (error) {
      result.error.push({
        label: `[ERR] ${student.firstName} ${student.lastName} (${student.matriculationNumber})`,
        error: error.toString(),
      })
    }
  }

  await deleteOldEnrolments({ versionId }, ctx)

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return await importData(uploadId, parseStudentsXLSX, importStudents, ctx)
})
