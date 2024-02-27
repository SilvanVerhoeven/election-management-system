import { CandidateList, Election, ElectionSet, StatusGroup, Upload } from "src/types"
import { generateWordDocument } from "./word"
import { getDisplayText } from "../components/displays/SubjectDisplay"
import { getCandidateListOrderDisplayText } from "./basis"
import { activeStatusGroup } from "./person"

export interface ProposalGenerationData {
  electionSet: ElectionSet
  election: Election
  lists: CandidateList[]
}

interface ProposalRenderCandidateData {
  index: number
  firstName: string
  lastName: string
  unit: string
}

interface ProposalRenderListData {
  listName: string
  order: string
  members: ProposalRenderCandidateData[]
}

interface ProposalRenderStatusGroupsData {
  statusGroupName: string
  lists: ProposalRenderListData[]
}

interface ProposalRenderData {
  year: number
  electionName: string | null
  committee: string
  statusGroups: ProposalRenderStatusGroupsData[]
}

const distinctStatusGroup = (
  sg: StatusGroup,
  index: number,
  statusGroups: StatusGroup[]
): boolean => {
  return statusGroups.findIndex((val) => val.globalId === sg.globalId, index) === index
}

/**
 * Restructures the candidate list data into a renderable format.
 * The layout is expected to display 3 lists in columns next to each other.
 *
 * @param lists Candidate lists
 * @returns Format that can be directly rendered
 */
const structureLists = (lists: CandidateList[]): ProposalRenderStatusGroupsData[] => {
  const statusGroups = lists
    .map((list) => (list.candidates[0] ? activeStatusGroup(list.candidates[0]) : null))
    .filter((statusGroup) => statusGroup !== undefined && statusGroup !== null)
    .filter(distinctStatusGroup) as StatusGroup[]

  return statusGroups.map((statusGroup) => {
    return {
      statusGroupName: statusGroup.name,
      lists: lists
        .filter((list) =>
          list.candidates[0]
            ? activeStatusGroup(list.candidates[0])?.globalId === statusGroup.globalId
            : false
        )
        .map((list) => {
          return {
            listName: list.shortName ? `${list.shortName} – ${list.name}` : list.name,
            order: getCandidateListOrderDisplayText(list.order),
            members: list.candidates.map((candidate, index): ProposalRenderCandidateData => {
              return {
                index: index + 1,
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                unit: "subjects" in candidate ? getDisplayText(candidate.subjects) : "TODO",
              }
            }),
          }
        }),
    }
  })
}

/**
 * Restructures the proposal data into a renderable format.
 *
 * @param data proposal data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: ProposalGenerationData): ProposalRenderData => {
  return {
    electionName: data.election.name || null,
    year: data.electionSet.startDate.getFullYear(),
    committee: data.election.committee.name,
    statusGroups: structureLists(data.lists),
  }
}

/**
 * Generate a proposal file.
 *
 * @param data Data for the proposal
 * @param template Template to use for file generation
 * @returns Proposal word document as Buffer
 */
export const generateProposal = async (
  data: ProposalGenerationData,
  template: Upload
): Promise<Buffer> => {
  return generateWordDocument(structureForRender(data), template)
}
