import Excel, { Worksheet } from "exceljs"

export type ParsedSubjectData = {
  externalId: number
  name: string
  shortName: string
  unitId: number
}

const parseSubjects = (sheet: Worksheet): ParsedSubjectData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .filter((row) => !isNaN(parseInt(row.getCell(5).text)))
    .map((row) => {
      return {
        externalId: row.getCell(1).value?.valueOf() as number,
        shortName: row.getCell(2).text,
        name: row.getCell(4).text,
        unitId: row.getCell(5).value?.valueOf() as number,
      }
    })
}

/**
 * Parse XLSX document with subjects.
 *
 * @param buffer XLSX document as buffer
 * @returns Subjects
 */
export const parseSubjectsXLSX = async (buffer: Buffer): Promise<ParsedSubjectData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const subjectsSheet = workbook.getWorksheet("k_fach")

  if (!subjectsSheet) throw new Error("Could not read XLSX file, missing 'k_fach' table")

  return parseSubjects(subjectsSheet)
}
