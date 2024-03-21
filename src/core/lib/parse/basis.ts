import Excel, { Worksheet } from "exceljs"
import { defaults, drawVerticalLine, applyDefaultStyle, generateIds, parseList } from "."

const addBasisWorksheet = (workbook: Excel.Workbook) => {
  const sheet = workbook.addWorksheet("Eckdaten")
  sheet.columns = [
    { header: "", width: 3 },
    { header: ["", "Name der Wahlen", "Jahr:"], width: 23 },
    { header: "", width: 75 },
  ]
}

const addConstituenciesWorksheet = (workbook: Excel.Workbook) => {
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

const addElectionsWorksheet = (workbook: Excel.Workbook) => {
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

const addCandidatesWorksheet = (workbook: Excel.Workbook) => {
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

const addCandidatesListsWorksheet = (workbook: Excel.Workbook) => {
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

const addSubjectWorksheet = (workbook: Excel.Workbook) => {
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
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
}

/**
 * Return the workbook containing basis data.
 * As of now, only the overall structure is generated.
 *
 * @returns Workbook containing basis data
 */
export const generateWorkbook = (): Excel.Workbook => {
  const workbook = new Excel.Workbook()
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

export type ParsedGeneralData = {
  name: string
  startDate: Date
  endDate: Date
}

export type ParsedSiteData = {
  name: string
  shortName: string
  description: string
}

export type ParsedPollingStationData = {
  name: string
  shortName: string
  siteNameOrShortName: string
}

export type ParsedConstituencyData = {
  name: string
  shortName: string
  pollingStationNameOrShortName: string
  description: string
}

export type ParsedStatusGroupData = {
  name: string
  shortName: string
  priority: number
}

export type ParsedPositionMapData = {
  position: string
  statusGroupNameOrShortName: string
}

export type ParsedCommitteeData = {
  name: string
  shortName: string
}

export type ParsedElectionData = {
  name?: string
  committeeNameOrShortName: string
  statusGroupNameOrShortNames: string[]
  constituencyNameOrShortNames: string[]
  numberOfSeats: number
}

export type ParsedBasisData = {
  general: ParsedGeneralData
  sites: ParsedSiteData[]
  pollingStations: ParsedPollingStationData[]
  constituencies: ParsedConstituencyData[]
  statusGroups: ParsedStatusGroupData[]
  positionMap: ParsedPositionMapData[]
  committees: ParsedCommitteeData[]
  elections: ParsedElectionData[]
}

const parseGeneralData = (sheet: Worksheet): ParsedGeneralData => {
  return {
    name: sheet.getCell("C2").text,
    startDate: new Date((sheet.getCell("C3").value?.valueOf() || 0) as number),
    endDate: new Date((sheet.getCell("C4").value?.valueOf() || 0) as number),
  }
}

const parseSites = (sheet: Worksheet): ParsedSiteData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        shortName: row.getCell(1).text,
        name: row.getCell(2).text,
        description: row.getCell(3).text,
      }
    })
    .filter((row) => !!row.name)
}

const parsePollingStations = (sheet: Worksheet): ParsedPollingStationData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        shortName: row.getCell(1).text,
        name: row.getCell(2).text,
        siteNameOrShortName: row.getCell(3).text,
      }
    })
    .filter((row) => !!row.name)
}

const parseConstituencies = (sheet: Worksheet): ParsedConstituencyData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        shortName: row.getCell(1).text,
        name: row.getCell(2).text,
        pollingStationNameOrShortName: row.getCell(3).text,
        description: row.getCell(4).text,
      }
    })
    .filter((row) => !!row.name)
}

const parseStatusGroups = (sheet: Worksheet): ParsedStatusGroupData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        shortName: row.getCell(1).text,
        name: row.getCell(2).text,
        priority: (row.getCell(3).value?.valueOf() || 0) as number,
      }
    })
    .filter((row) => !!row.name)
}

const parsePositionMap = (sheet: Worksheet): ParsedPositionMapData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows.map((row) => {
    return {
      position: row.getCell(1).text,
      statusGroupNameOrShortName: row.getCell(2).text,
    }
  })
}

const parseCommittees = (sheet: Worksheet): ParsedCommitteeData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        shortName: row.getCell(1).text,
        name: row.getCell(2).text,
      }
    })
    .filter((row) => !!row.name)
}

const parseElections = (sheet: Worksheet): ParsedElectionData[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  return rawRows
    .map((row) => {
      return {
        name: row.getCell(1).text || undefined,
        committeeNameOrShortName: row.getCell(2).text,
        statusGroupNameOrShortNames: parseList(row.getCell(3).text),
        constituencyNameOrShortNames: parseList(row.getCell(4).text),
        numberOfSeats: (row.getCell(5).value?.valueOf() || 0) as number,
      }
    })
    .filter(
      (row) =>
        !!row.committeeNameOrShortName &&
        row.statusGroupNameOrShortNames.length > 0 &&
        row.constituencyNameOrShortNames.length > 0 &&
        row.numberOfSeats
    )
}

/**
 * Parse excel document with basis data for elections.
 * Contains general election data, individual elections, candidate lists, candidates and voting results.
 *
 * @param buffer Excel document as buffer
 * @returns Data of the elections
 */
export const parseBasisExcel = async (buffer: Buffer): Promise<ParsedBasisData> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const generalSheet = workbook.getWorksheet("Eckdaten")
  const sitesSheet = workbook.getWorksheet("Standorte")
  const pollingStationsSheet = workbook.getWorksheet("Wahllokale")
  const constituenciesSheet = workbook.getWorksheet("Wahlkreise")
  const statusGroupsSheet = workbook.getWorksheet("Statusgruppen")
  const positionMapSheet = workbook.getWorksheet("Mapping Positionen")
  const committeesSheet = workbook.getWorksheet("Gremien")
  const electionsSheet = workbook.getWorksheet("Einzelwahlen")

  if (!generalSheet) throw new Error("Excel file missing general information worksheet")
  if (!sitesSheet) throw new Error("Excel file missing sites worksheet")
  if (!pollingStationsSheet) throw new Error("Excel file missing polling stations worksheet")
  if (!constituenciesSheet) throw new Error("Excel file missing constituencies worksheet")
  if (!statusGroupsSheet) throw new Error("Excel file missing status groups worksheet")
  if (!positionMapSheet) throw new Error("Excel file missing position map worksheet")
  if (!committeesSheet) throw new Error("Excel file missing committees worksheet")
  if (!electionsSheet) throw new Error("Excel file missing elections worksheet")

  const data: ParsedBasisData = {
    general: parseGeneralData(generalSheet),
    sites: parseSites(sitesSheet),
    pollingStations: parsePollingStations(pollingStationsSheet),
    constituencies: parseConstituencies(constituenciesSheet),
    statusGroups: parseStatusGroups(statusGroupsSheet),
    positionMap: parsePositionMap(positionMapSheet),
    committees: parseCommittees(committeesSheet),
    elections: parseElections(electionsSheet),
  }

  return data
}
