export const templateTypes = {
  Results: "results",
  Config: "config",
} as const

export type TemplateTypes = (typeof templateTypes)[keyof typeof templateTypes]

export type Person = {
  firstname: string
  lastname: string
  email: string
  status: "electable" | "rejected" | string
  comment: string
  electabilityVerifiedOn: Date
  isElectionHelper: boolean
  statusGroups: []
}

export type Student =
  | Person
  | {
      type: "student"
      matriculationNumber: string
      subject: Subject
      explicitelyVoteAt?: Faculty
    }

export type Employee =
  | Person
  | {
      type: "employee"
      worksAt: Department
    }

export type Candidate = Student | Employee

export type Subject = {
  name: string
  shortName: string
  belongsTo: Faculty
}

export type Campus = {
  name: string
  shortName: string
}

export type Constituency = {
  name: string
  shortName: string
  description: string
  presenceVotingAt: PollingStation
}

type CommonUnitProps = {
  name: string
  shortName: string
  description: string
  associatedWith: Campus
  assignedTo: Constituency
}

export type Department =
  | CommonUnitProps
  | {
      type: "department"
    }

export type Faculty =
  | CommonUnitProps
  | {
      type: "faculty"
    }

export type Unit = Department | Faculty

export type PollingStation = {
  name: string
  shortName: string
  locatedAt: Campus
}

export type ElectionResult = {
  votes: number
  status?: "elected" | "deputy" | "reserve"
  candidate: Candidate
}

export type CandidateList = {
  name: string
  shortName?: string
  order: "alphabetical" | "numeric"
  submittedOn: Date
  candidates: Candidate[]
  candidatesFor: Election
}

export type Election = {
  type: "majority" | "ballot"
  numberOfSeats: number
  concerns: Committee
  eligibleFor: StatusGroup[]
  results: ElectionResult[]
}

export type Committee = {
  name: string
  shortName: string
  numberOfSeats: number
}

export type StatusGroup = {
  name: string
  shortName: string
  priority: number
}

export type Elections = {
  name: string
  startDate: Date
  endDate: Date
  elections: Election
}

export type ElectionData = ElectionDefinition & {
  boxOffice: string
  lists: CandidateList[]
}

export type ElectionDefinition = {
  committee: string
  statusGroups: string[]
  constituencies: string[]
  numberOfSeats: number
}

export type BasisData = {
  electionsTitle: string
  startDate: Date
  endDate: Date
  elections: ElectionDefinition
  candidates: Candidate[]
}
