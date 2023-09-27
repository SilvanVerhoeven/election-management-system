import ExcelJS from "exceljs"
import { defaults, drawVerticalLine, applyDefaultStyle } from '.'

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
    { header: ["Benutzerdefinierte Wahlkreise", "Kürzel"], width: 11 },
    { header: ["", "Name"], width: 45 },
    { header: ["", "Typ"], width: 11 },
    { header: "", width: 11 },
    { header: ["Automatisch generierte Wahlkreise", "Kürzel"], width: 7 },
    { header: ["", "Name"], width: 17 },
    { header: ["", "Beschreibung"], width: 67 },
  ]

  sheet.getRow(1).alignment = { ...defaults.alignment, horizontal: 'center' }
  sheet.getRow(1).font = defaults.fontBold
  sheet.getRow(2).font = defaults.fontBold

  sheet.autoFilter = 'A2:C2'

  sheet.mergeCells('A1:C1')
  sheet.getCell('A1').fill = {
    pattern: 'solid',
    fgColor: { argb: '00FFD966' },
    type: "pattern"
  }

  sheet.mergeCells('E1:G1')
  sheet.getCell('E1').fill = {
    pattern: 'solid',
    fgColor: { argb: '00D9D9D9' },
    type: "pattern"
  }

  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }]

  drawVerticalLine(sheet, 4)
}

const addElectionsWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Einzelwahlen")

  sheet.columns = [
    { header: "Gremium", width: 20 },
    { header: "Statusgruppe", width: 18 },
    { header: "Wahlkreise", width: 18 },
    { header: "Sitzanzahl", width: 14 },
  ]

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = 'A1:D1'

  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
}

const addCandidatesWorksheet = (workbook: ExcelJS.Workbook) => {
  const sheet = workbook.addWorksheet("Kandidaturen")

  sheet.columns = [
    { header: "Vorname", width: 23 },
    { header: "Nachname", width: 23 },
    { header: "Statusgruppe", width: 19 },
    { header: "Fakultät", width: 23 },
    { header: "Studiengang", width: 25 },
    { header: "Matrikel-/Personalnr.", width: 25 },
  ]

  sheet.getRow(1).font = defaults.fontBold

  sheet.autoFilter = 'A1:F1'

  sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }]

  drawVerticalLine(sheet, 2)
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
  applyDefaultStyle(workbook)

  return workbook
}
