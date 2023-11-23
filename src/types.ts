import {
  CandidateList as DbCandidateList,
  CandidateListPosition as DbCandidateListPosition,
  Campus as DbCampus,
  Committee as DbCommittee,
  Constituency as DbConstituency,
  Election as DbElection,
  Elections as DbElections,
  Person as DbPerson,
  PollingStation as DbPollingStation,
  StatusGroup as DbStatusGroup,
  Subject as DbSubject,
  Unit as DbUnit,
  VotingResult as DbVotingResult,
  Upload as DbUpload,
} from "db"

export const templateType = {
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

export enum CandidateListOrderType {
  ALPHABETICALLY = "alphabetical",
  NUMERIC = "numeric",
}

export enum UploadType {
  TEMPLATE = "template",
  DATA = "data",
}

export type Upload = DbUpload

export type Template = DbUpload & {
  type: UploadType.TEMPLATE
  key: string
}

export type Data = DbUpload & {
  type: UploadType.DATA
  key?: string
}

export type Person = DbPerson & {
  status: "electable" | "rejected" | string
  statusGroups: StatusGroup[]
}

export type Student = Person & {
  type: PersonType.STUDENT
  matriculationNumber: string | null
  subject: Subject | null
  explicitelyVoteAt: Faculty | null
}

export type Employee = Person & {
  type: PersonType.EMPLOYEE
  worksAt: Department | null
}

export type Candidate = Student | Employee

export type Subject = DbSubject & {
  belongsTo: Faculty
}

export type Campus = DbCampus

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
  locatedAt: Campus
}

export type StatusGroup = DbStatusGroup

export type VotingResult = DbVotingResult & {
  candidate: Person
}

export type CandidateList = DbCandidateList & {
  order: CandidateListOrderType
  candidates: Candidate[]
}

export type CandidateListPosition = DbCandidateListPosition

export type Election = DbElection & {
  type: ElectionType
  committee: Committee
  statusGroups: StatusGroup[]
  constituencies: Constituency[]
}

export type Committee = DbCommittee

export type Elections = DbElections & {
  elections: Election[]
}

// --- Election

export type ListResult = {
  list: CandidateList
  ranking: (Candidate & { votes: number })[]
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
  electionsName: string // Name of the overall elections this committee was elected at
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
