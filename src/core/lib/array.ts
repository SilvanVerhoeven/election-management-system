/**
 * Check whether two arrays have the same values in the same number of occurencies.
 *
 * @param a Array 1
 * @param b Array 2
 * @returns True if both arrays have the same values and any value occurs equally often in both arrays
 */
export const haveEqualValues = <T>(a: T[], b: T[]) =>
  a.concat().sort().join(",") == b.concat().sort().join(",")
