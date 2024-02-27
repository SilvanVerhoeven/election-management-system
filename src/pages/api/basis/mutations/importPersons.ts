import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import findStatusGroup from "../queries/findStatusGroup"
import { ParsedStudentData, parsePersonsCSV } from "src/core/lib/parse/persons"
import createStudent from "./createStudent"
import findSubject from "../queries/findSubject"
import { ImportResult, importData, returnNullOnError } from "src/core/lib/import"
import { Subject } from "src/types"

const importStudents = async (students: ParsedStudentData[], versionId: number, ctx: Ctx) => {
  const studentStatusGroup = await findStatusGroup({ nameOrShortName: "Studierende" }, ctx)
  // const academicEmployeeStatusGroup = await findStatusGroup(
  //   { nameOrShortName: "Wissenschaftliche Mitarbeitende" },
  //   ctx
  // )

  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const student of students) {
    // const faculty = await findUnit({ externalId: student.explicitelyVoteAtFacultyId }, ctx)
    const subjects = await Promise.all(
      student.subjectsShortName.map((shortName) =>
        returnNullOnError(() => findSubject({ shortName }, ctx))
      )
    )

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

    await createStudent(
      {
        firstName: student.firstName,
        lastName: student.lastName,
        matriculationNumber: student.matriculationNumber,
        subjectIds: (subjects as Subject[]).map((subject) => subject.globalId),
        statusGroupIds: [studentStatusGroup.globalId],
        versionId,
      },
      ctx
    )

    result.success++
  }

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return await importData(
    uploadId,
    parsePersonsCSV,
    (data, versionId, ctx) => importStudents(data.students, versionId, ctx),
    ctx
  )
})
