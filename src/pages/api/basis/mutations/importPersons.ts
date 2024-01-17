import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import getUpload from "../../files/queries/getUpload"
import { getFilePath } from "src/core/lib/files"
import { readFile } from "fs/promises"
import findStatusGroup from "../queries/findStatusGroup"
import createVersion from "./createVersion"
import { ParsedStudentData, parsePersonsCSV } from "src/core/lib/parse/persons"
import createSubject from "./createSubject"
import createFaculty from "./createFaculty"
import createStudent from "./createStudent"

const importStudents = async (students: ParsedStudentData[], versionId: number, ctx: Ctx) => {
  const studentStatusGroup = await findStatusGroup({ nameOrShortName: "Studierende" }, ctx)
  const academicEmployeeStatusGroup = await findStatusGroup(
    { nameOrShortName: "Wissenschaftliche Mitarbeitende" },
    ctx
  )

  for (const student of students) {
    const statusGroups = student.isOnlyStudent
      ? [studentStatusGroup]
      : [studentStatusGroup, academicEmployeeStatusGroup]

    const faculty = await createFaculty(
      {
        name: student.facultyName,
        versionId,
      },
      ctx
    )

    const subject = await createSubject(
      {
        name: student.subjectName,
        belongsToId: faculty.globalId,
        versionId,
      },
      ctx
    )

    await createStudent(
      {
        firstName: student.firstName,
        lastName: student.lastName,
        matriculationNumber: student.matriculationNumber,
        subjectId: subject.globalId,
        statusGroupIds: statusGroups.map((sg) => sg.globalId),
        versionId,
      },
      ctx
    )
  }
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  const upload = await getUpload(uploadId, ctx)
  const buffer = await readFile(getFilePath(upload))
  const data = await parsePersonsCSV(buffer)

  const version = await createVersion({ uploadId: upload.id }, ctx)

  await importStudents(data.students, version.id, ctx)
})
