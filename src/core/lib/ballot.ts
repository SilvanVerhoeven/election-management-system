import fs from "fs/promises"
import { CandidateListOrderType, ElectionType, PersonType, Upload, templateType } from "src/types"
import Excel, { Worksheet } from "exceljs"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { parseList } from "./excel"
import { getFilePath } from "./files"

type _Election = {
  type: ElectionType
  committee: string
  statusGroups: string[]
  constituencies: string[]
  numberOfSeats: number
  pollingStation: string
}

type _Candidate = {
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
}

type _CandidateList = {
  candidates: _Candidate[]
  name: string
  shortName: string
  order: CandidateListOrderType
}

export type _Ballot = {
  election: _Election
  lists: _CandidateList[]
}

type CandidateRow = {
  listName: string
  listShortName: string
  firstName: string
  lastName: string
  order: string
  unit: string
  type: string
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
    })
  })

  return Object.values(listDict)
}

export const parseBallotExcel = async (buffer: Buffer): Promise<_Ballot> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)

  const generalSheet = workbook.getWorksheet("Info")
  const candidatesSheet = workbook.getWorksheet("Kandidaturen")

  if (!generalSheet || !candidatesSheet)
    throw new Error("Excel file does not contain mandatory worksheets")

  const data: _Ballot = {
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

const structureLists = (lists: _CandidateList[]) => {
  const render = []
  const numberOfColumns = 3
  for (let i = 0; i < lists.length; i += numberOfColumns) {
    const parallelLists: _CandidateList[] = []

    for (let index = 0; index < numberOfColumns; index++) {
      if (!!lists[i + index]) parallelLists.push(lists[i + index]!)
    }

    const group = {
      list1name: parallelLists[0]?.name,
      list2name: parallelLists[1]?.name ?? "",
      list3name: parallelLists[2]?.name ?? "",
      members: [],
    }
    const maxLength = Math.max(...parallelLists.map((list) => list.candidates.length))
    for (let j = 0; j < maxLength; j++) {
      const parallelCandidates = {
        index: j + 1,
      }
      for (let offset = 0; offset < parallelLists.length; offset++) {
        if (!parallelLists[offset] || !parallelLists[offset]?.candidates[j]) continue
        const candidate = parallelLists[offset]?.candidates[j]!
        parallelCandidates[offset + 1] = {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          unit: candidate.subject ?? candidate?.department,
        }
      }
      group.members.push(parallelCandidates as never)
    }
    render.push(group as never)
  }
  return render
}

/**
 * Restructures the ballot data into a renderable format.
 *
 * @param data ballot data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: _Ballot) => {
  return {
    committee: data.election.committee,
    statusGroup: data.election.statusGroups[0],
    lists: structureLists(data.lists),
  }
}

export const generateBallot = async (data: _Ballot, template: Upload) => {
  // Load the docx file as binary content
  const content = await fs.readFile(getFilePath(template), "binary")

  const zip = new PizZip(content)

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render(structureForRender(data))

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    compression: "DEFLATE",
  })

  // buf is a nodejs Buffer, you can either write it to a
  // file or res.send it with express for example.
  return buf
}
