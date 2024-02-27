import Excel, { Worksheet } from "exceljs"

export type ParsedStudentData = {
  firstName: string
  lastName: string
  matriculationNumber: string
  explicitelyVoteAtFacultyId: number
  subjectsShortName: string[]
  // isOnlyStudent: boolean // Phd students are not only students and may count to other status groups as well
}

export type ParsedPersonData = {
  students: ParsedStudentData[]
}

const parseStudents = (sheet: Worksheet): ParsedStudentData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      matriculationNumber: row.getCell(2).text,
      lastName: row.getCell(3).text,
      firstName: row.getCell(4).text,
      explicitelyVoteAtFacultyId: row.getCell(6).value?.valueOf() as number,
      subjectsShortName: [row.getCell(7).text, row.getCell(9).text, row.getCell(11).text].filter(
        (shortName) => shortName !== "" && shortName !== " "
      ),
      // isOnlyStudent: row.getCell(5).text == "0",
    }
  })
}

/**
 * Parse CSV document with persons.
 *
 * @param buffer CSV document as buffer
 * @returns Persons
 */
export const parsePersonsCSV = async (buffer: Buffer): Promise<ParsedPersonData> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const studentsSheet = workbook.worksheets[0]

  if (!studentsSheet) throw new Error("Could not read XLSX file")

  return {
    students: parseStudents(studentsSheet),
  }
}
