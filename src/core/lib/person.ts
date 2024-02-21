import { Candidate, StatusGroup } from "src/types"

/**
 * Compare function to sort persons alphabetically by name.
 *
 * @returns Comparator number (`+1`, `-1, `0`)
 */
export const byName = (person1: Candidate, person2: Candidate) =>
  fullName(person1).localeCompare(fullName(person2))

/**
 * Returns the full name of a person.
 *
 * @param person Person to return full name for
 * @returns Full name of a person, e.g. `Mika Mustermensch`
 */
export const fullName = (person: Candidate) => `${person.firstName} ${person.lastName}`

/**
 * Returns the full name of a person in the format of 'lastname, firstname'.
 *
 * @param person Person to return full name for
 * @returns Full name of a person, e.g. `Mustermensch, Mika`
 */
export const fullNameLastFirst = (person: Candidate) => `${person.lastName}, ${person.firstName}`

/**
 * Returns a person's status group with the highest priority, i.e. the status group the person should be counted to.
 *
 * @param person Person to get status group for
 * @returns Status group of person with highest (i.e. largest) priority. If the person has no status group, `undefined` is returned
 */
export const activeStatusGroup = (person: Candidate): StatusGroup | undefined =>
  person.statusGroups.concat().sort((a, b) => b.priority - a.priority)[0]
