import { _ElectionData, _CandidateList } from "./candidates"
import { CandidateListOrderType, PersonType, Upload } from "src/types"
import { formatList } from "./excel"
import { generateWordDocument } from "../word"

/**
 * Restructures the candidate list data into a renderable format.
 *
 * @param lists Candidate lists
 * @returns Format that can be directly rendered
 */
const structureLists = (lists: _CandidateList[]) => {
  return lists.map((list) => {
    return {
      name: list.name,
      shortName: list.shortName,
      order: list.order == CandidateListOrderType.ALPHABETICALLY ? "Alphabetisch" : "Rangfolge",
      candidates: list.candidates.map((candidate) => {
        return {
          votes: candidate.votes,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          unit: candidate.type === PersonType.STUDENT ? candidate.subject : candidate.department,
        }
      }),
    }
  })
}

/**
 * Restructures the ballot data into a renderable format.
 *
 * @param data ballot data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: _ElectionData) => {
  return {
    committee: data.election.committee,
    district: formatList(data.election.constituencies),
    statusGroup: formatList(data.election.statusGroups),
    boxOffice: data.election.pollingStation,
    numberOfSeats: data.election.numberOfSeats,
    lists: structureLists(data.lists),
  }
}

/**
 * Generate a result file.
 *
 * @param data Data for the result
 * @param template Template to use for file generation
 * @returns Result word document as Buffer
 */
export const generateResult = async (data: _ElectionData, template: Upload) => {
  return generateWordDocument(structureForRender(data), template)
}
