import Excel, { Worksheet } from "exceljs"
import { Readable } from "stream"

export type ParsedUnitData = {
  externalId: string
  name: string
  shortName?: string
}

export type ParsedAccountUnitMapping = {
  accountingUnitId: string
  unitExternalId: string // Unit externalId
}

const parseFaculties = (sheet: Worksheet): ParsedUnitData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      externalId: row.getCell(1).text,
      shortName: row.getCell(3).text,
      name: row.getCell(4).text,
    }
  })
}

/**
 * Parse CSV document with faculties.
 *
 * @param buffer CSV document as buffer
 * @returns Units
 */
export const parseFacultyCSV = async (buffer: Buffer): Promise<ParsedUnitData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.csv.read(Readable.from(buffer), {
    parserOptions: {
      delimiter: ";",
      encoding: "utf8",
    },
  })

  const facultySheet = workbook.getWorksheet(1)

  if (!facultySheet) throw new Error("Could not read CSV file")

  return parseFaculties(facultySheet)
}

const parseDepartments = (sheet: Worksheet): ParsedUnitData[] => {
  const rawRows = sheet.getRows(5, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        externalId: row.getCell(1).text,
        name: row.getCell(3).text,
      }
    })
    .filter((unit) => unit.externalId !== "")
}

/**
 * Parse XLSX document with departments.
 *
 * @param buffer XLSX document as buffer
 * @returns Units
 */
export const parseDepartmentsXLSX = async (buffer: Buffer): Promise<ParsedUnitData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const departmentSheet = workbook.getWorksheet("VER_Lehr_und_Forschungsbereiche")

  if (!departmentSheet)
    throw new Error("Could not read XLSX file, missing 'VER_Lehr_und_Forschungsbereiche' table")

  return parseDepartments(departmentSheet)
}

const parseAccountingUnits = (sheet: Worksheet): ParsedAccountUnitMapping[] => {
  const parseUnitExternalId = (rawValue: string): string => {
    const match = new RegExp("^(\\d+) - .+$").exec(rawValue)
    return match && match[1] ? match[1] : ""
  }

  const rawRows = sheet.getRows(9, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        accountingUnitId: parseInt(row.getCell(5).master.text).toString(),
        unitExternalId: parseUnitExternalId(row.getCell(12).text),
      }
    })
    .filter((unit) => unit.unitExternalId !== "")
}

/**
 * Parse XLSX document with accounting units.
 *
 * @param buffer CSV document as buffer
 * @returns Unit map
 */
export const parseAccountingUnitMapXLSX = async (
  buffer: Buffer
): Promise<ParsedAccountUnitMapping[]> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const accountingUnitSheet = workbook.getWorksheet("FIN_1_01_k_bst")

  if (!accountingUnitSheet)
    throw new Error("Could not read XLSX file, missing 'FIN_1_01_k_bst' table")

  return parseAccountingUnits(accountingUnitSheet)
}
