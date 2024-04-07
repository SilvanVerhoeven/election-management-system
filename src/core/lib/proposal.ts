import {
  CandidateList,
  Committee,
  Constituency,
  Election,
  ElectionGroupingType,
  ElectionSet,
  StatusGroup,
  Upload,
} from "src/types"
import { generateWordDocument } from "./word"
import { getDisplayText } from "../components/displays/SubjectDisplay"
import { getCandidateListOrderDisplayText } from "./basis"
import { activeStatusGroup } from "./person"
import dayjs from "dayjs"
import { areIdentical } from "./array"

export interface ProposalGenerationData {
  electionSet: ElectionSet
  election: Election
  lists: CandidateList[]
}

export interface GenerationData {
  electionSet: ElectionSet
  electionsGroupedBy: ElectionGroupingType
  committee: Committee
  elections: Election[]
  lists: CandidateList[]
}

interface ProposalRenderCandidateData {
  index: number
  firstName: string
  lastName: string
  unit: string
}

interface CommitteeRenderData {
  name: string
  shortName: string | null
}

interface RenderCandidateData {
  index: number
  firstName: string
  lastName: string
  unit: string
}

interface RenderCandidateListData {
  name: string
  shortName: string | null
  orderType: string
  members: RenderCandidateData[]
}

interface RenderConstituencyData {
  name: string
  shortName: string | null
}

interface RenderGroupedC_ElectionData {
  name: string
  numberOfVotes: number
  lists: RenderCandidateListData[]
  constituencies: RenderConstituencyData[]
}

interface RenderGroupedCC_ElectionData {
  name: string
  numberOfVotes: number
  lists: RenderCandidateListData[]
}

interface RenderStatusGroupData {
  name: string
  shortName: string | null
}

type RenderGroupedC_StatusGroupData = RenderStatusGroupData & {
  elections: RenderGroupedC_ElectionData[]
}

type RenderGroupedCC_StatusGroupData = RenderStatusGroupData & {
  elections: RenderGroupedCC_ElectionData[]
}

type RenderData = {
  electionsGroupedBy: ElectionGroupingType
  date: string
  electionSetName: string
  committee: CommitteeRenderData
} & (
  | {
      electionsGroupedBy: ElectionGroupingType.COMMITTEE
      statusGroups: RenderGroupedC_StatusGroupData[]
    }
  | {
      electionsGroupedBy: ElectionGroupingType.COMMITTEE_CONSTITUENCY
      constituencies: RenderConstituencyData[]
      statusGroups: RenderGroupedCC_StatusGroupData[]
    }
  | {
      electionsGroupedBy: ElectionGroupingType.COMMITTEE_STATUSGROUP
      statusGroups: RenderStatusGroupData[]
      elections: RenderGroupedC_ElectionData[]
    }
)

const distinctObjects = <T extends StatusGroup | Constituency>(
  object: T,
  index: number,
  objects: T[]
): boolean => {
  return objects.findIndex((val) => val.globalId === object.globalId, index) === index
}

const structureConstituencies = (constituencies: Constituency[]): RenderConstituencyData[] => {
  return constituencies.map((constituency) => {
    return {
      name: constituency.name,
      shortName: constituency.shortName,
    }
  })
}

const structureStatusGroups = (statusGroups: StatusGroup[]): RenderStatusGroupData[] => {
  return statusGroups.map((statusGroup) => {
    return {
      name: statusGroup.name,
      shortName: statusGroup.shortName,
    }
  })
}

const structureCandidateLists = (lists: CandidateList[]): RenderCandidateListData[] => {
  return lists.map((list) => {
    return {
      name: list.name,
      shortName: list.shortName,
      orderType: getCandidateListOrderDisplayText(list.order),
      members: list.candidates.map((candidate, index): ProposalRenderCandidateData => {
        return {
          index: index + 1,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          unit: !!candidate.enrolment
            ? getDisplayText(candidate.enrolment.subjects)
            : candidate.employments.map((e) => e.employedAt.name).join(", "),
        }
      }),
    }
  })
}

const structureGroupedC_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    constituencies: structureConstituencies(election.constituencies),
    lists: groupByStatusGroup(lists, election.statusGroups).flatMap(({ lists }) =>
      structureCandidateLists(lists)
    ),
  }
}

const structureGroupedCS_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    constituencies: structureConstituencies(election.constituencies),
    lists: structureCandidateLists(lists),
  }
}

const structureGroupedCC_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedCC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    lists: groupByStatusGroup(lists, election.statusGroups).flatMap(({ lists }) =>
      structureCandidateLists(lists)
    ),
  }
}

const structureGroupedC_StatusGroups = (
  statusGroup: StatusGroup,
  elections: Election[],
  lists: CandidateList[]
): RenderGroupedC_StatusGroupData => {
  const electionsWithStatusGroup = elections.filter((election) =>
    areIdentical(election.statusGroups, [statusGroup])
  )
  return {
    name: statusGroup.name,
    shortName: statusGroup.shortName,
    elections: electionsWithStatusGroup.map((election) =>
      structureGroupedC_Election(election, lists)
    ),
  }
}

const structureGroupedCC_StatusGroups = (
  statusGroup: StatusGroup,
  elections: Election[],
  lists: CandidateList[]
): RenderGroupedCC_StatusGroupData => {
  const electionsWithStatusGroup = elections.filter((election) =>
    areIdentical(election.statusGroups, [statusGroup])
  )
  return {
    name: statusGroup.name,
    shortName: statusGroup.shortName,
    elections: electionsWithStatusGroup.map((election) =>
      structureGroupedCC_Election(election, lists)
    ),
  }
}

const groupByStatusGroup = (
  lists: CandidateList[],
  includedStatusGroups: StatusGroup[] = []
): { statusGroup: StatusGroup; lists: CandidateList[] }[] => {
  const distinctStatusGroups = (
    lists
      .map((list) => (list.candidates[0] ? activeStatusGroup(list.candidates[0]) : null))
      .filter((statusGroup) => statusGroup !== undefined && statusGroup !== null) as StatusGroup[]
  ).filter(distinctObjects)

  return distinctStatusGroups
    .filter(
      (statusGroup) =>
        includedStatusGroups.findIndex((sg) => sg.globalId === statusGroup.globalId) > -1
    )
    .map((statusGroup) => {
      return {
        statusGroup,
        lists: lists.filter((list) =>
          list.candidates[0]
            ? activeStatusGroup(list.candidates[0])?.globalId === statusGroup.globalId
            : false
        ),
      }
    })
}

/**
 * Restructures the proposal data into a renderable format.
 *
 * @param data proposal data to restructure
 * @returns Format that can be directly rendered
 */
const structureForRender = (data: GenerationData): RenderData => {
  const commonFields = {
    date: dayjs().format(process.env.DATE_FORMAT || "DD/MM/YYYY"),
    electionSetName: data.electionSet.name,
    committee: {
      name: data.committee.name,
      shortName: data.committee.shortName,
    },
  }

  const affectedStatusGroups = data.elections
    .flatMap((election) => election.statusGroups)
    .filter(distinctObjects)
  affectedStatusGroups.sort((a, b) => a.priority - b.priority)

  if (data.electionsGroupedBy === ElectionGroupingType.COMMITTEE) {
    return {
      ...commonFields,
      electionsGroupedBy: ElectionGroupingType.COMMITTEE,
      statusGroups: affectedStatusGroups.map((statusGroup) =>
        structureGroupedC_StatusGroups(statusGroup, data.elections, data.lists)
      ),
    }
  }

  if (data.electionsGroupedBy === ElectionGroupingType.COMMITTEE_CONSTITUENCY) {
    return {
      ...commonFields,
      electionsGroupedBy: ElectionGroupingType.COMMITTEE_CONSTITUENCY,
      constituencies: data.elections
        .flatMap((election) => election.constituencies)
        .filter(distinctObjects),
      statusGroups: affectedStatusGroups.map((statusGroup) =>
        structureGroupedCC_StatusGroups(statusGroup, data.elections, data.lists)
      ),
    }
  }

  return {
    ...commonFields,
    electionsGroupedBy: ElectionGroupingType.COMMITTEE_STATUSGROUP,
    statusGroups: affectedStatusGroups,
    elections: data.elections.map((election) => structureGroupedCS_Election(election, data.lists)),
  }
}

/**
 * Generate a proposal file.
 *
 * @param data Data for the proposal
 * @param template Template to use for file generation
 * @returns Proposal word document as Buffer
 */
export const generateProposal = async (data: GenerationData, template: Upload): Promise<Buffer> => {
  return generateWordDocument(structureForRender(data), template)
}
