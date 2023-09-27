import Excel from 'exceljs'
import { Row } from 'exceljs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'node:fs/promises'
import path from 'path'
import { templatesDir } from './files'
import { templateTypes } from './types'

const candidateNameRegEx = new RegExp("(.*), (.*) \\((.*)\\)")
const courseRegEx = new RegExp("(\\d*)\\.")

type Candidate = {
  position: number
  firstname: string
  lastname: string
  course: string
  votes: number
  status?: "elected" | "deputy" | "reserve"
}

type CandidateList = {
  name: string
  order: "alphabetical" | "numeric"
  candidates: Candidate[]
}

type ElectionData = {
  committee: string
  district: string
  statusGroup: string
  boxOffice: string
  numberOfSeats: number
  lists: CandidateList[]
}

/**
 * Skips to the beginning of the next candidate list (first row contains list name).
 * Rows before are being deleted.
 * 
 * @param rows Rows which may contain another candidate list
 * @returns Remaining rows. First contains list name.
 */
const skipToNextList = (rows: Row[]) => {
  while (rows.length > 0 && rows[0].getCell(3).text != "Listenname") rows = rows.slice(1)
  return rows.length == 0 ? [] : rows.slice(1)
}

const parseCandidateList = (rows: Row[]): { list: CandidateList, unconsumedRows: Row[] } | null => {
  rows = skipToNextList(rows)
  if (rows.length == 0 || rows[0].getCell(3).value == null) return null

  const list: CandidateList = {
    name: rows[0].getCell(3).text,
    order: rows[0].getCell(1).value == null ? "alphabetical" : "numeric",
    candidates: []
  }

  rows = rows.slice(1)

  while (rows.length > 0 && rows[0].getCell(3).text != "Listenname") {
    const nameMatch = (rows[0].getCell(3).text).match(candidateNameRegEx)
    const positionMatch = ((list.order == "alphabetical" ? rows[0].getCell(2) : rows[0].getCell(1)).text).match(courseRegEx)
    if (!nameMatch || !positionMatch) throw new Error(`Kandidat nicht korrekt formatiert in Zeile: ${rows[0].values}`)
    const candidate: Candidate = {
      firstname: nameMatch[2].toString(),
      lastname: nameMatch[1].toString(),
      course: nameMatch[3].toString(),
      votes: rows[0].getCell(4).value as number,
      position: parseInt(positionMatch[1].toString()),
    }
    list.candidates.push(candidate)
    rows = rows.slice(1)
  }

  return { list, unconsumedRows: rows }
}

const parseCandidateLists = (rows: Row[]) => {
  const lists: CandidateList[] = []
  while (rows.length > 0) {
    const result = parseCandidateList(rows)
    if (!result) break
    lists.push(result.list)
    rows = result.unconsumedRows
  }
  return lists
}

/**
 * Takes a result file as a buffer and returns the contained election data.
 */
export const parseResultsFile = async (buffer: Buffer): Promise<ElectionData> => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]

  const committee = worksheet.getCell('D1').text
  const district = worksheet.getCell('D2').text
  const statusGroup = worksheet.getCell('D4').text
  const boxOffice = worksheet.getCell('D3').text
  const numberOfSeats = worksheet.getCell('D5').value as number

  const lists = parseCandidateLists(worksheet.getRows(1, worksheet.rowCount) || [])

  return {
    committee,
    district,
    statusGroup,
    boxOffice,
    numberOfSeats,
    lists
  }
}

/**
 * Takes election data and returns the HTML necessary to display results.
 */
export const generateResultHtml = (electionData: ElectionData) => {
  const getSubsetHtml = (list: CandidateList, start: number, numberOfSeats?: number) => {
    const subsetCandidates = list.candidates.sort((a, b) => b.votes - a.votes).slice(start, numberOfSeats ? start + numberOfSeats : undefined)
    return `<table>
        ${subsetCandidates.map((candidate: Candidate) => `
          <tr>
            <td>${candidate.votes}<td>
            <td>${candidate.lastname}, ${candidate.firstname} (${candidate.course})<td>
          </tr>
        `).reduce((previous, current) => previous + current)}
      </table>`
  }

  const getListHtml = (list: CandidateList) => `
    <h4>${list.name}</h4>
    <h5>${list.order == 'alphabetical' ? 'in alphabetischer Reihenfolge' : 'in Listen-Reihenfolge'}</h5>
    <h6>Gewählt</h6>
    ${getSubsetHtml(list, 0, electionData.numberOfSeats)}
    <h6>Stellvertretungen</h6>
    ${getSubsetHtml(list, electionData.numberOfSeats, electionData.numberOfSeats)}
    <h6>Reserve</h6>
    ${getSubsetHtml(list, electionData.numberOfSeats * 2 + 1)}
  `

  return `
    <!doctype html>
    <html lang="de">
    
    <body>
      <h1>Wahlergebnis</h1>
      <h2>${electionData.committee} der ${electionData.district}</h2>
      <h3>${electionData.statusGroup}</h3>
      ${electionData.lists.map(getListHtml).reduce((previous, current) => previous + current)}
    </body>
    
    </html>
  `
}

export const generateResultWord = async (electionData: ElectionData) => {
  // Load the docx file as binary content
  const content = await fs.readFile(
    path.resolve(templatesDir(), path.join(templateTypes.Results, `${templateTypes.Results}.docx`)),
    "binary"
  )

  const zip = new PizZip(content)

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render(electionData)

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
