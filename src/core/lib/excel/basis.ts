import ExcelJS from "exceljs"
import { defaults, drawVerticalLine, applyDefaultStyle, generateIds } from "."

const addBasisWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Eckdaten")
  sheet.columns = [
    { header: "", width: 3 },
    { header: ["", "Name der Wahlen", "Jahr:"], width: 23 },
    { header: "", width: 75 },
  ]
}

const addConstituenciesWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Wahlkreise")

  sheet.columns = [
    { header: "Kürzel", width: 11 },
    { header: "Name", width: 45 },
    { header: "Wahllokal", width: 13 },
    { header: "Beschreibung", width: 67 },
  ]

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = "A1:D1"

  sheet.views = [{ state: "frozen", ySplit: 1 }]
}

const addElectionsWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Einzelwahlen")

  sheet.columns = [
    { header: "ID", width: 6 },
    { header: "Gremium", width: 20 },
    { header: "Statusgruppen", width: 19 },
    { header: "Wahlkreise", width: 18 },
    { header: "Sitzanzahl", width: 14 },
  ]

  generateIds(sheet, 50)

  sheet.getCell("B1").note = "Kürzel"
  sheet.getCell("C1").note = "Kürzel"

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = "A1:D1"

  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }]
}

const addCandidatesWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Kandidaturen")

  sheet.columns = [
    { header: ["", "ID"], width: 6 },
    { header: ["", "Vorname"], width: 23 },
    { header: ["", "Nachname"], width: 23 },
    { header: ["", "Statusgruppe"], width: 19 },
    { header: ["", "E-Mail"], width: 23 },
    { header: ["", "Fakultät/Bereich"], width: 23 },
    { header: ["Nur für Studierende", "Studiengang"], width: 25 },
    { header: ["", "Matrikelnr."], width: 13 },
    { header: ["", "Status"], width: 13 },
    { header: ["", "Wahlhelfer:in"], width: 16 },
    { header: ["", "Wählbarkeit geprüft am"], width: 25 },
    { header: ["", "Anmerkung"], width: 25 },
  ]

  generateIds(sheet, 100, 1, 3)

  sheet.getCell("D2").note = "Kürzel"
  sheet.getCell("G2").note = "Kürzel"
  sheet.getCell("I2").note = 'z.B. "wählbar" und "abgelehnt"'
  sheet.getCell("J2").note = '"ja" oder "nein"'
  sheet.getCell("K2").note = "Format: DD.MM.YYYY"

  sheet.mergeCells("E1:H1")
  sheet.getRow(1).alignment = { ...defaults.alignment, horizontal: "center" }

  sheet.getRow(1).font = defaults.fontBold
  sheet.getRow(2).font = defaults.fontBold

  sheet.autoFilter = "A2:L2"

  sheet.views = [{ state: "frozen", xSplit: 2, ySplit: 2 }]

  drawVerticalLine(sheet, 2)
}

const addCandidatesListsWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Wahllisten")

  sheet.columns = [
    { header: "Name", width: 23 },
    { header: "Kürzel", width: 13 },
    { header: "Einzelwahl", width: 13 },
    { header: "Reihenfolge", width: 15 },
    { header: "Mitglieder", width: 40 },
  ]

  sheet.getCell("C1").note = "ID der Einzelwahl"
  sheet.getCell("D1").note = '"alphabetisch" oder "numerisch"'
  sheet.getCell("E1").note = "ID der Mitglieder, getrennt durch Kommata"

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = "A1:E1"

  sheet.views = [{ state: "frozen", xSplit: 1 }]
}

const addSubjectWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Studiengänge")

  sheet.columns = [
    { header: "Kürzel", width: 20 },
    { header: "Name", width: 50 },
  ]

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = "A1:B1"

  sheet.views = [{ state: "frozen", ySplit: 1 }]
}

/**
 * Return data from given basis data excel file.
 *
 * @param file Excel file containing basis data
 * @returns Basis data of an election
 */
export const parseWorkbook = async (file: File) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
}

/**
 * Return the workbook containing basis data.
 * As of now, only the overall structure is generated.
 *
 * @returns Workbook containing basis data
 */
export const generateWorkbook = (): ExcelJS.Workbook => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Election Management System"

  addBasisWorksheet(workbook)
  addConstituenciesWorksheet(workbook)
  addElectionsWorksheet(workbook)
  addCandidatesWorksheet(workbook)
  addCandidatesListsWorksheet(workbook)
  addSubjectWorksheet(workbook)
  applyDefaultStyle(workbook)

  return workbook
}
