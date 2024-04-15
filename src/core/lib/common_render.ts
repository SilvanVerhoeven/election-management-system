import {
  CandidateList,
  Committee,
  Constituency,
  Election,
  ElectionGroupingType,
  StatusGroup,
} from "src/types"
import { getCandidateListOrderDisplayText } from "./basis"
import { getDisplayText } from "../components/displays/SubjectDisplay"

export interface RenderConstituencyData {
  name: string
  shortName: string | null
}

export interface RenderStatusGroupData {
  name: string
  shortName: string | null
}

export interface RenderCommitteeData {
  name: string
  shortName: string | null
}

export interface RenderCandidateData {
  index: number
  firstName: string
  lastName: string
  unit: string
}

export interface RenderCandidateListData {
  name: string
  shortName: string | null
  orderType: string
  members: RenderCandidateData[]
}

export interface RenderGroupedC_ElectionData {
  name: string
  numberOfVotes: number
  lists: RenderCandidateListData[]
  constituencies: RenderConstituencyData[]
}

export interface RenderCommonData {
  date: string
  electionSetName: string
  committee: RenderCommitteeData
  electionsGroupedBy: ElectionGroupingType
}

export const structureConstituencies = (
  constituencies: Constituency[]
): RenderConstituencyData[] => {
  return constituencies.map((constituency) => {
    return {
      name: constituency.name,
      shortName: constituency.shortName,
    }
  })
}

export const structureStatusGroups = (statusGroups: StatusGroup[]): RenderStatusGroupData[] => {
  return statusGroups.map((statusGroup) => {
    return {
      name: statusGroup.name,
      shortName: statusGroup.shortName,
    }
  })
}

export const structureCommittee = (committee: Committee): RenderCommitteeData => {
  return {
    name: committee.name,
    shortName: committee.shortName,
  }
}

export const structureCandidateLists = (lists: CandidateList[]): RenderCandidateListData[] => {
  return lists.map((list) => {
    return {
      name: list.name,
      shortName: list.shortName,
      orderType: getCandidateListOrderDisplayText(list.order),
      members: list.candidates.map((candidate, index): RenderCandidateData => {
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

export const structureGroupedCS_Election = (
  election: Election,
  lists: CandidateList[]
): RenderGroupedC_ElectionData => {
  return {
    name: election.name ?? "",
    numberOfVotes: election.numberOfSeats,
    constituencies: structureConstituencies(election.constituencies),
    lists: structureCandidateLists(
      lists.filter((list) => list.candidatesForId === election.globalId)
    ),
  }
}
