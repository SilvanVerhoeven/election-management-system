import {
  AccountUnitMap as DbAccountUnitMap,
  CandidateList as DbCandidateList,
  CandidateListPosition as DbCandidateListPosition,
  Site as DbSite,
  Committee as DbCommittee,
  Constituency as DbConstituency,
  Election as DbElection,
  ElectionSet as DbElectionSet,
  Employment as DbEmployment,
  Enrolment as DbEnrolment,
  Person as DbPerson,
  PollingStation as DbPollingStation,
  StatusGroup as DbStatusGroup,
  Subject as DbSubject,
  SubjectOccupancy as DbSubjectOccupency,
  Unit as DbUnit,
  VotingResult as DbVotingResult,
  Upload as DbUpload,
  Version as DbVersion,
} from "db"

export const templateType = {
  Proposal: "proposal",
  Ballot: "ballot",
  Results: "results",
  Config: "config",
} as const

export type TemplateType = (typeof templateType)[keyof typeof templateType]

export enum PersonType {
  STUDENT = "student",
  EMPLOYEE = "employee",
}

export enum UnitType {
  FACULTY = "faculty",
  DEPARTMENT = "department",
}

export enum ElectionType {
  MAJORITY = "majority",
  BALLOT = "ballot",
}

export enum ElectionGroupingType {
  COMMITTEE = "C",
  COMMITTEE_CONSTITUENCY = "C+C",
  COMMITTEE_STATUSGROUP = "C+S",
}

export enum CandidateListOrderType {
  ALPHABETICALLY = "alphabetical",
  NUMERIC = "numeric",
}

export enum UploadType {
  TEMPLATE = "template",
  DATA = "data",
}

export enum CandidateStatusType {
  ELECTABLE = "electable",
  REJECTED = "rejected",
}

export type AccountUnitMap = DbAccountUnitMap

export type CandidateStatus = CandidateStatusType | string | null

export type Version = DbVersion

export type Upload = DbUpload & {
  version?: Version
}

export type Template = DbUpload & {
  type: UploadType.TEMPLATE
  key: string
}

export type Data = DbUpload & {
  type: UploadType.DATA
  key?: string
}

export type Employment = DbEmployment & {
  employedAt: Department
}

export type Enrolment = DbEnrolment & {
  subjects: Subject[]
  explicitelyVoteAt: Faculty | null
}

export type Person = DbPerson & {
  statusGroups: StatusGroup[]
  employments: Employment[]
  enrolment: Enrolment | null
}

export type Student = Person & {
  enrolment: Enrolment
}

export type Employee = Person & {
  employments: [Employment, ...Employment[]]
}

export type Subject = DbSubject & {
  belongsTo: Faculty
}

export type SubjectOccupancy = DbSubjectOccupency

export type Site = DbSite

export type Constituency = DbConstituency & {
  presenceVotingAt: PollingStation
}

type CommonUnitProps = DbUnit

export type Department = CommonUnitProps & {
  type: UnitType.DEPARTMENT
}

export type Faculty = CommonUnitProps & {
  type: UnitType.FACULTY
}

export type Unit = Department | Faculty

export type PollingStation = DbPollingStation & {
  locatedAt: Site
}

export type StatusGroup = DbStatusGroup

export type VotingResult = DbVotingResult & {
  candidate: Person
}

export type CandidateList = DbCandidateList & {
  order: CandidateListOrderType
  candidates: Person[]
  candidatesFor: Election
}

export type CandidateListPosition = DbCandidateListPosition

export type Election = DbElection & {
  committee: Committee
  statusGroups: StatusGroup[]
  constituencies: Constituency[]
}

export type Committee = DbCommittee & {
  electionsGroupedBy: ElectionGroupingType
}

export type ElectionSet = DbElectionSet

export type Basis = {
  general: ElectionSet
  sites: Site[]
  pollingStations: PollingStation[]
  constituencies: Constituency[]
  statusGroups: StatusGroup[]
  committees: Committee[]
  elections: Election[]
}

// --- Election

export type ListResult = {
  list: CandidateList
  ranking: (Person & { votes: number })[]
}

export type ElectionResult = {
  [statusGroupId: number]: {
    // dict from StatusGroup ID to this status group's election result
    statusGroup: StatusGroup
    lists: ListResult[]
    ballotTotal: number
    invalidBallotTotal: number
    eligibleVotersTotal: number
  }
}

export type CandidateResultRender = {
  votes: number
  firstName: string
  lastName: string
  subject: string
}

export type ListResultRender = {
  listName: string
  elected: CandidateResultRender[]
  deputy: CandidateResultRender[]
  reserve: CandidateResultRender[]
  notElected: CandidateResultRender[]
}

export type StatusGroupResultRender = {
  lists: ListResultRender
  ballotsTotal: number
  validBallotsTotal: number
  turnout: number
}

export type CommitteeResultRender = {
  electionSetName: string
  committee: string
  statusGroups: StatusGroupResultRender[]
  publishedOn: Date
  lastEditOn?: Date
}

// OTHER (may be removed) -------------------------------

// export type ElectionResult = ElectionDefinition & {
//   boxOffice: string
//   lists: CandidateList[]
// }

// export type ElectionDefinition = {
//   committee: string
//   statusGroups: string[]
//   constituencies: string[]
//   numberOfSeats: number
// }

// export type ElectionResult = {
//   votes: number
//   status?: "elected" | "deputy" | "reserve"
//   candidate: Candidate
// }

// export type BasisData = {
//   electionsTitle: string
//   startDate: Date
//   endDate: Date
//   elections: ElectionDefinition
//   candidates: Candidate[]
// }
