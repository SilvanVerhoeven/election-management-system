import Excel, { Worksheet } from "exceljs"
import { Readable } from "stream"

export type ParsedStudentData = {
  externalId: string
  firstName: string
  lastName: string
  matriculationNumber: string
  explicitelyVoteAtFacultyId: number // Unit externalId (faculty)
  subjectsShortName: string[] // assumption: Order in subject priority
}

const parseStudents = (sheet: Worksheet): ParsedStudentData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      externalId: row.getCell(2).text,
      matriculationNumber: row.getCell(3).text,
      lastName: row.getCell(4).text,
      firstName: row.getCell(5).text,
      explicitelyVoteAtFacultyId: row.getCell(7).value?.valueOf() as number,
      subjectsShortName: [row.getCell(8).text, row.getCell(10).text, row.getCell(12).text].filter(
        (shortName) => shortName !== "" && shortName !== " "
      ),
    }
  })
}

/**
 * Parse XLSX document with students.
 *
 * @param buffer XLSX document as buffer
 * @returns Persons
 */
export const parseStudentsXLSX = async (buffer: Buffer): Promise<ParsedStudentData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const studentsSheet = workbook.worksheets[0]

  if (!studentsSheet) throw new Error("Could not read XLSX file")

  return parseStudents(studentsSheet)
}

export type ParsedEmployeeData = {
  externalId: string
  firstName: string
  lastName: string
  accountingId1: string // we are given two different accounting IDs. They should always match. If not, the employee should not be parsed and the user should be informed
  accountingId2: string
  position: string
}

const parseEmployees = (sheet: Worksheet): ParsedEmployeeData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      externalId: row.getCell(1).text,
      firstName: row.getCell(4).text,
      lastName: row.getCell(5).text,
      accountingId1: row.getCell(6).text,
      accountingId2: row.getCell(7).text,
      position: row.getCell(8).text,
    }
  })
}

/**
 * Parse CSV document with employees.
 *
 * @param buffer CSV document as buffer
 * @returns Persons
 */
export const parseEmployeesCSV = async (buffer: Buffer): Promise<ParsedEmployeeData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.csv.read(Readable.from(buffer), {
    parserOptions: {
      delimiter: ";",
      encoding: "utf8",
    },
  })

  const employeesSheet = workbook.worksheets[0]

  if (!employeesSheet) throw new Error("Could not read CSV file")

  return parseEmployees(employeesSheet)
}
