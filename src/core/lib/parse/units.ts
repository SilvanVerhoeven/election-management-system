import Excel, { Worksheet } from "exceljs"
import { Readable } from "stream"

export type ParsedUnitData = {
  externalId: number
  name: string
  shortName: string
}

const parseUnits = (sheet: Worksheet): ParsedUnitData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      externalId: row.getCell(1).value?.valueOf() as number,
      shortName: row.getCell(3).text,
      name: row.getCell(4).text,
    }
  })
}

/**
 * Parse CSV document with untis.
 *
 * @param buffer CSV document as buffer
 * @returns Units
 */
export const parseUnitsCSV = async (buffer: Buffer): Promise<ParsedUnitData[]> => {
  const workbook = new Excel.Workbook()
  await workbook.csv.read(Readable.from(buffer), {
    parserOptions: {
      delimiter: ";",
      encoding: "utf8",
    },
  })

  const unitSheet = workbook.getWorksheet(1)

  if (!unitSheet) throw new Error("Could not read CSV file")

  return parseUnits(unitSheet)
}
