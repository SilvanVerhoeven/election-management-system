import { CandidateList, Election, ElectionSet, Upload } from "src/types"
import { formatList } from "./parse"
import { generateWordDocument } from "./word"
import { getDisplayText } from "../components/displays/SubjectDisplay"

export interface BallotGenerationData {
  electionSet: ElectionSet
  election: Election
  lists: CandidateList[]
}

interface BallotRenderCandidateData {
  firstName: string
  lastName: string
  unit: string
}

interface BallotRenderListRowData {
  0: BallotRenderCandidateData
  1: BallotRenderCandidateData
  2: BallotRenderCandidateData
  index1?: number
  index2?: number
  index3?: number
}

interface BallotRenderListData {
  list1name: string
  list2name: string
  list3name: string
  members: BallotRenderListRowData[]
}

interface BallotRenderData {
  year: number
  electionName: string | null
  committee: string
  statusGroup: string
  lists: BallotRenderListData[]
}

/**
 * Restructures the candidate list data into a renderable format.
 * The layout is expected to display 3 lists in columns next to each other.
 *
 * @param lists Candidate lists
 * @returns Format that can be directly rendered
 */
const structureLists = (lists: CandidateList[]): BallotRenderListData[] => {
  const render: BallotRenderListData[] = []
  const numberOfColumns = 3
  for (let i = 0; i < lists.length; i += numberOfColumns) {
    const parallelLists: CandidateList[] = []

    for (let index = 0; index < numberOfColumns; index++) {
      if (!!lists[i + index]) parallelLists.push(lists[i + index]!)
    }

    const group: BallotRenderListData = {
      list1name: parallelLists[0]?.name ?? "",
      list2name: parallelLists[1]?.name ?? "",
      list3name: parallelLists[2]?.name ?? "",
      members: [],
    }
    const maxLength = Math.max(...parallelLists.map((list) => list.candidates.length))
    for (let j = 0; j < maxLength; j++) {
      const parallelCandidates: any = {}
      for (let offset = 0; offset < parallelLists.length; offset++) {
        if (!parallelLists[offset] || !parallelLists[offset]?.candidates[j]) continue
        parallelCandidates[`index${offset + 1}`] = j + 1
        const candidate = parallelLists[offset]?.candidates[j]!
        parallelCandidates[offset + 1] = {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          unit: !!candidate.enrolment
            ? getDisplayText(candidate.enrolment.subjects)
            : candidate.employments.map((e) => e.employedAt.name).join(", "),
        }
      }
      group.members.push(parallelCandidates as BallotRenderListRowData)
    }
    render.push(group)
  }
  return render
}

/**
 * Restructures the ballot data into a renderable format.
 *
 * @param data ballot data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: BallotGenerationData): BallotRenderData => {
  return {
    electionName: data.election.name || null,
    year: data.electionSet.startDate.getFullYear(),
    committee: data.election.committee.name,
    statusGroup: formatList(data.election.statusGroups.map((sg) => sg.name)),
    lists: structureLists(data.lists),
  }
}

/**
 * Generate a ballot file.
 *
 * @param data Data for the ballot
 * @param template Template to use for file generation
 * @returns Ballot word document as Buffer
 */
export const generateBallot = async (
  data: BallotGenerationData,
  template: Upload
): Promise<Buffer> => {
  return generateWordDocument(structureForRender(data), template)
}
