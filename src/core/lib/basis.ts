import { CandidateListOrderType } from "src/types"

/**
 * Returns the display text of the candidate list order in its simplest form.
 *
 * @param order Order to get display text for
 * @returns `numerisch` or `alphabetisch`
 */
export const getCandidateListOrderDisplayText = (order: CandidateListOrderType) =>
  order === CandidateListOrderType.NUMERIC ? "numerisch" : "alphabetisch"
