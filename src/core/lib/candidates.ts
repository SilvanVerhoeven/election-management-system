import { CandidateListOrderType, ElectionType, PersonType } from "src/types"
import Excel, { Worksheet } from "exceljs"
import { parseList } from "./excel"

type _Election = {
  type: ElectionType
  committee: string
  statusGroups: string[]
  constituencies: string[]
  numberOfSeats: number
  pollingStation: string
}

export type _Candidate = {
  type: PersonType
  firstName: string
  lastName: string
  email?: string
  status?: string
  comment?: string
  electabilityVerifiedOn?: Date
  isElectionHelper?: boolean
  subject?: string
  department?: string
  votes: number
}

export type _CandidateList = {
  candidates: _Candidate[]
  name: string
  shortName: string
  order: CandidateListOrderType
}

export type _ElectionData = {
  election: _Election
  lists: _CandidateList[]
}

export type _EvaluatedList = _CandidateList & {
  totalVotes: number
  numberOfSeats: number
  hareNiemeyerQuotient: string
}

export type _ElectionResult = {
  election: _Election
  lists: _EvaluatedList[]
}

type CandidateRow = {
  listName: string
  listShortName: string
  firstName: string
  lastName: string
  order: string
  unit: string
  type: string
  votes: number
}

const fullName = (row: CandidateRow) => `${row.firstName} ${row.lastName}`
const byOrder = (a: CandidateRow, b: CandidateRow) => a.order.localeCompare(b.order)
const byName = (a: CandidateRow, b: CandidateRow) => fullName(a).localeCompare(fullName(b))

/**
 * Parses and returns all candidate lists from the given worksheet.
 *
 * @param sheet Worksheet with list of all candidates
 * @returns Candidate list
 */
const parseCandidateList = (sheet: Worksheet): _CandidateList[] => {
  const rawRows = sheet.getRows(2, sheet.rowCount - 1) ?? []
  const rows: CandidateRow[] = rawRows.map((row) => {
    return {
      listName: row.getCell(1).text,
      listShortName: row.getCell(2).text,
      order: row.getCell(3).text,
      firstName: row.getCell(4).text,
      lastName: row.getCell(5).text,
      unit: row.getCell(6).text,
      type: row.getCell(7).text,
      votes: (row.getCell(8).value?.valueOf() as number) || 0,
    }
  })

  const listDict: { [listName: string]: _CandidateList } = {}

  // initialize lists before sorting to keep list order of excel file
  rows.forEach((row) => {
    if (!(row.listName in listDict))
      listDict[row.listName] = {
        name: row.listName,
        shortName: row.listShortName,
        order:
          row.order.toLowerCase() === "alphabetisch"
            ? CandidateListOrderType.ALPHABETICALLY
            : CandidateListOrderType.NUMERIC,
        candidates: [],
      }
  })

  rows.sort(byName)
  rows.sort(byOrder)
  rows.forEach((row) => {
    const type = row.type.toLowerCase() == "stud" ? PersonType.STUDENT : PersonType.EMPLOYEE

    listDict[row.listName]!.candidates.push({
      firstName: row.firstName,
      lastName: row.lastName,
      type,
      subject: type == PersonType.STUDENT ? row.unit : undefined,
      department: type == PersonType.EMPLOYEE ? row.unit : undefined,
      votes: row.votes,
    })
  })

  return Object.values(listDict)
}

/**
 * Parse excel document with candidates per election.
 * Contains general election data, candidate lists, candidates and voting results.
 *
 * @param buffer Excel document as buffer
 * @returns Data of the election, including candidates
 */
export const parseCandidatesExcel = async (buffer: Buffer): Promise<_ElectionData> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const generalSheet = workbook.getWorksheet("Info")
  const candidatesSheet = workbook.getWorksheet("Kandidaturen")

  if (!generalSheet || !candidatesSheet)
    throw new Error("Excel file does not contain mandatory worksheets")

  const data: _ElectionData = {
    election: {
      committee: generalSheet.getCell("C2").text,
      constituencies: parseList(generalSheet.getCell("C3").text),
      statusGroups: parseList(generalSheet.getCell("C4").text),
      numberOfSeats: generalSheet.getCell("C5").value?.valueOf() as number,
      pollingStation: generalSheet.getCell("C6").text,
      type:
        generalSheet.getCell("C6").text == "Losen" ? ElectionType.BALLOT : ElectionType.MAJORITY,
    },
    lists: parseCandidateList(candidatesSheet),
  }

  return data
}
