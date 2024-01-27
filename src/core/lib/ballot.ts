import { _ElectionData, _CandidateList } from "./candidates"
import { Upload } from "src/types"
import { formatList } from "./parse"
import { generateWordDocument } from "../word"

/**
 * Restructures the candidate list data into a renderable format.
 * The layout is expected to display 3 lists in columns next to each other.
 *
 * @param lists Candidate lists
 * @returns Format that can be directly rendered
 */
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
      const parallelCandidates = {}
      for (let offset = 0; offset < parallelLists.length; offset++) {
        if (!parallelLists[offset] || !parallelLists[offset]?.candidates[j]) continue
        parallelCandidates[`index${offset + 1}`] = j + 1
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
const structureForRender = (data: _ElectionData) => {
  return {
    committee: data.election.committee,
    statusGroup: formatList(data.election.statusGroups),
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
export const generateBallot = async (data: _ElectionData, template: Upload): Promise<Buffer> => {
  return generateWordDocument(() => structureForRender(data), template)
}
