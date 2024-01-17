import Excel, { Worksheet } from "exceljs"
import { Readable } from "stream"

export type ParsedStudentData = {
  firstName: string
  lastName: string
  matriculationNumber: string
  facultyName: string
  subjectName: string
  isOnlyStudent: boolean // Phd students are not only students and may count to other status groups as well
}

export type ParsedPersonData = {
  students: ParsedStudentData[]
}

const parseStudents = (sheet: Worksheet): ParsedStudentData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        lastName: row.getCell(1).text,
        firstName: row.getCell(2).text,
        facultyName: row.getCell(3).text,
        subjectName: row.getCell(4).text,
        isOnlyStudent: row.getCell(5).text == "0",
        matriculationNumber: row.getCell(6).text,
      }
    })
    .filter((row) => !!row.lastName)
}

/**
 * Parse CSV document with persons.
 *
 * @param buffer CSV document as buffer
 * @returns Persons
 */
export const parsePersonsCSV = async (buffer: Buffer): Promise<ParsedPersonData> => {
  const workbook = new Excel.Workbook()
  await workbook.csv.read(Readable.from(buffer), {
    parserOptions: {
      delimiter: ";",
      encoding: "latin1", // ANSI encoding
    },
  })

  const studentsSheet = workbook.getWorksheet(1)

  if (!studentsSheet) throw new Error("Could not read CSV file")

  return {
    students: parseStudents(studentsSheet),
  }
}
