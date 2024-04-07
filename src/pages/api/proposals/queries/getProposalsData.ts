import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Committee, Constituency, Election, ElectionGroupingType } from "src/types"
import getCommittees from "../../basis/queries/getCommittees"
import getElections from "../../basis/queries/getElections"

export interface ProposalData {
  committee: Committee
  constituencies?: Constituency[]
}

export const distinctConstituencies = (
  value: Election,
  index: number,
  self: Election[]
): boolean => {
  return (
    self
      .map((e) => e.constituencies.map((c) => c.globalId).join(","))
      .indexOf(value.constituencies.map((c) => c.globalId).join(",")) === index
  )
}

/**
 * Returns data (committee and constituencies) for all proposals of the latest election set.
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<ProposalData[]> => {
  const allCommittees = await getCommittees(null, ctx)
  const allElections = await getElections(null, ctx)

  return (
    await Promise.all(
      allCommittees.map(async (committee): Promise<ProposalData | ProposalData[]> => {
        if (committee.electionsGroupedBy == ElectionGroupingType.COMMITTEE_CONSTITUENCY) {
          const filteredElections = allElections
            .filter((election) => election.committee.globalId == committee.globalId)
            .filter(distinctConstituencies)

          return filteredElections.map((election) => {
            return {
              committee,
              constituencies: election.constituencies,
            }
          })
        }

        return {
          committee,
        }
      })
    )
  ).flat()
})
