import readExcelFile from 'read-excel-file/node'
import { Row } from 'read-excel-file'

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
  while (rows.length > 0 && rows[0][2].valueOf() != "Listenname") rows = rows.slice(1)
  return rows.length == 0 ? [] : rows.slice(1)
}

const parseCandidateList = (rows: Row[]): { list: CandidateList, unconsumedRows: Row[] } | null => {
  rows = skipToNextList(rows)
  if (rows.length == 0 || rows[0][2] == null) return null
  
  const list: CandidateList = {
    name: rows[0][2].toString(),
    order: rows[0][0] == null ? "alphabetical" : "numeric",
    candidates: []
  }

  rows = rows.slice(1)

  while (rows.length > 0 && rows[0][2].valueOf() != "Listenname") {
    const nameMatch = (rows[0][2].valueOf() as string).match(candidateNameRegEx)
    const positionMatch = ((list.order == "alphabetical" ? rows[0][1] : rows[0][0]).valueOf() as string).match(courseRegEx)
    if (!nameMatch || !positionMatch) throw  new Error(`Kandidat nicht korrekt formatiert in Zeile: ${rows}`)
    const candidate: Candidate = {
      firstname: nameMatch[2].toString(),
      lastname: nameMatch[1].toString(),
      course: nameMatch[3].toString(),
      votes: rows[0][3].valueOf() as number,
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
  const rows = await readExcelFile(buffer)

  const committee = rows[0][3].valueOf() as string
  const district = rows[1][3].valueOf() as string
  const statusGroup = rows[3][3].valueOf() as string
  const boxOffice = rows[2][3].valueOf() as string
  const numberOfSeats = rows[4][3].valueOf() as number

  const lists = parseCandidateLists(rows)

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
    const subsetCandidates = list.candidates.sort((a, b) => b.votes - a.votes).slice(start, numberOfSeats ? start+numberOfSeats : undefined)
    return `<table>
        ${subsetCandidates.map((candidate: Candidate) => `
          <tr>
            <td>${candidate.votes}<td>
            <td>${candidate.lastname}, ${candidate.firstname} (${candidate.course})<td>
          </tr>
        `).reduce((previous, current) => previous+current)}
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
    ${getSubsetHtml(list, electionData.numberOfSeats*2+1)}
  `
  
  return `
    <!doctype html>
    <html lang="de">
    
    <body>
      <h1>Wahlergebnis</h1>
      <h2>${electionData.committee} der ${electionData.district}</h2>
      <h3>${electionData.statusGroup}</h3>
      ${electionData.lists.map(getListHtml).reduce((previous, current) => previous+current)}
    </body>
    
    </html>
  `
}