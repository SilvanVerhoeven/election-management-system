import {
  _ElectionData,
  _Candidate,
  _CandidateList,
  _ElectionResult,
  _EvaluatedList,
} from "./candidates"
import { CandidateListOrderType, PersonType, Upload } from "src/types"
import { formatList } from "./excel"
import { generateWordDocument } from "../word"

const formatCandidate = (candidate: _Candidate | null) => {
  return {
    votes: !!candidate ? candidate.votes : "-",
    firstName: candidate?.firstName || "",
    lastName: candidate?.lastName || "Vakant",
    unit: !candidate
      ? "-"
      : candidate.type === PersonType.STUDENT
      ? candidate.subject
      : candidate.department,
  }
}

/**
 * Restructures the candidate list data into a renderable format.
 *
 * @param lists Candidate lists
 * @returns Format that can be directly rendered
 */
const structureLists = (lists: _EvaluatedList[]) => {
  const totalVotes = lists.reduce((subTotal, list) => subTotal + list.totalVotes, 0)
  return lists.map((list) => {
    const electedCandidates = list.candidates.filter((candidate) => candidate.votes > 0)
    const numberOfVacantSeats = Math.max(list.numberOfSeats - electedCandidates.length, 0)
    if (numberOfVacantSeats) electedCandidates.push(...Array(numberOfVacantSeats).fill(null))

    const notElectedCandidates =
      list.numberOfSeats == 0
        ? list.candidates
        : list.candidates.filter((candidate) => candidate.votes == 0)

    const elected = electedCandidates.slice(0, list.numberOfSeats)
    const deputy = electedCandidates.slice(list.numberOfSeats, 2 * list.numberOfSeats)
    const reserve = list.numberOfSeats == 0 ? [] : electedCandidates.slice(2 * list.numberOfSeats)

    return {
      name: list.name,
      shortName: list.shortName,
      order: list.order == CandidateListOrderType.ALPHABETICALLY ? "Alphabetisch" : "Numerisch",
      votes: list.totalVotes,
      share: ((list.totalVotes / totalVotes) * 100).toFixed(2),
      hnQuotient: list.hareNiemeyerQuotient,
      hasElected: elected.length > 0,
      elected: elected.map(formatCandidate),
      hasDeputy: deputy.length > 0,
      deputy: deputy.map(formatCandidate),
      hasReserve: reserve.length > 0,
      reserve: reserve.map(formatCandidate),
      hasNotElected: notElectedCandidates.length > 0,
      notElected: notElectedCandidates.map(formatCandidate),
    }
  })
}

/**
 * Restructures the ballot data into a renderable format.
 *
 * @param data ballot data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: _ElectionResult) => {
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
export const generateResult = async (data: _ElectionResult, template: Upload) => {
  return generateWordDocument(structureForRender(data), template)
}
