/**
 * Check whether two arrays have the same values in the same number of occurencies.
 *
 * @param a Array 1
 * @param b Array 2
 * @returns True if both arrays have the same values and any value occurs equally often in both arrays
 */
export const haveEqualValues = <T>(a: T[], b: T[]) =>
  a.concat().sort().join(",") == b.concat().sort().join(",")

/**
 * Helper for `Array.filter` that allows to filter out all unique values of the filtered array.
 *
 * Usage example:
 * ```
 * const array = [1, 2, 3, 3]
 * const uniqueValues = array.filter(disctinct)
 * ```
 *
 * @returns Whether the currently looked at value is the first of its kind in the array.
 */
export const distinct = <T>(value: T, index: number, self: T[]): boolean => {
  return self.indexOf(value) === index
}
