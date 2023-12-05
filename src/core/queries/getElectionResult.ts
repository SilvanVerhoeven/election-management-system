import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { _CandidateList, _ElectionData, _ElectionResult, _EvaluatedList } from "../lib/candidates"

/**
 * Computes the number of seats obtained by all lists in the given election using the [Hare/Niemeyer method](https://de.wikipedia.org/wiki/Hare/Niemeyer-Verfahren).
 *
 * @param data Data for the election in questions
 * @returns All lists with their obtained number of seats
 */
const computeSeatsPerList = (data: _ElectionData): _EvaluatedList[] => {
  const lists: _EvaluatedList[] = data.lists.map((list) => {
    return {
      ...list,
      totalVotes: getNumberOfVotes(list),
      numberOfSeats: 0,
      hareNiemeyerQuotient: "",
    }
  })

  const totalVotes = lists.reduce((subTotal, list) => subTotal + list.totalVotes, 0)

  const hareQuota = totalVotes / data.election.numberOfSeats

  lists.forEach(
    (list, index) =>
      (lists[index] = {
        ...list,
        numberOfSeats: Math.floor(list.totalVotes / hareQuota),
        hareNiemeyerQuotient: (list.totalVotes / hareQuota).toFixed(2), // only thought for later display, do not use for calculation
      })
  )

  const leftSeats =
    data.election.numberOfSeats -
    lists.reduce((partialSum, list) => partialSum + list.numberOfSeats, 0)

  const listRemainders = lists.map((list) => list.totalVotes % hareQuota)
  listRemainders.sort((a, b) => b - a)
  const remainderThreshold = listRemainders[leftSeats - 1]
  if (!remainderThreshold) return lists
  if (listRemainders[leftSeats] == remainderThreshold)
    throw new Error("Relevant tie in number of votes")

  lists.forEach((list) =>
    list.totalVotes % hareQuota >= remainderThreshold ? (list.numberOfSeats += 1) : null
  )

  return lists
}

const getNumberOfVotes = (list: _CandidateList): number =>
  list.candidates.reduce((subTotal, candidate) => subTotal + candidate.votes, 0)

/**
 * Performs the [Largest Remainder Method](https://en.wikipedia.org/wiki/Largest_remainder_method) (Hare/Niemeyer) on given election data
 *   and returns election result.
 */
export default resolver.pipe(async (data: _ElectionData, ctx: Ctx): Promise<_ElectionResult> => {
  const evaluatedLists = computeSeatsPerList(data)
  evaluatedLists.forEach((list) => list.candidates.sort((a, b) => b.votes - a.votes))

  const result: _ElectionResult = {
    election: data.election,
    lists: evaluatedLists,
  }

  return result
})
