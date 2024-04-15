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
import { activeStatusGroup } from "./person"
import dayjs from "dayjs"
import { areIdentical } from "./array"
import {
  RenderCandidateListData,
  RenderCommonData,
  RenderConstituencyData,
  RenderGroupedC_ElectionData,
  RenderStatusGroupData,
  structureCandidateLists,
  structureCommittee,
  structureConstituencies,
  structureGroupedCS_Election,
} from "./common_render"

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

interface RenderGroupedCC_ElectionData {
  name: string
  numberOfVotes: number
  lists: RenderCandidateListData[]
}

type RenderGroupedC_StatusGroupData = RenderStatusGroupData & {
  elections: RenderGroupedC_ElectionData[]
}

type RenderGroupedCC_StatusGroupData = RenderStatusGroupData & {
  elections: RenderGroupedCC_ElectionData[]
}

type RenderData = RenderCommonData &
  (
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

const structureGroupedC_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    constituencies: structureConstituencies(election.constituencies),
    lists: groupByStatusGroup(
      lists.filter((list) => list.candidatesForId === election.globalId),
      election.statusGroups
    ).flatMap(({ lists }) => structureCandidateLists(lists)),
  }
}

const structureGroupedCC_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedCC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    lists: groupByStatusGroup(
      lists.filter((list) => list.candidatesForId === election.globalId),
      election.statusGroups
    ).flatMap(({ lists }) => structureCandidateLists(lists)),
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
    committee: structureCommittee(data.committee),
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
