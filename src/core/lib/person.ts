import { Person, StatusGroup } from "src/types"

/**
 * Compare function to sort persons alphabetically by name.
 *
 * @returns Comparator number (`+1`, `-1, `0`)
 */
export const byName = (person1: Person, person2: Person) =>
  fullName(person1).localeCompare(fullName(person2))

/**
 * Returns the full name of a person.
 *
 * @param person Person to return full name for
 * @returns Full name of a person, e.g. `Mika Mustermensch`
 */
export const fullName = (person: Person) => `${person.firstName} ${person.lastName}`

/**
 * Returns a person's status group with the highest priority, i.e. the status group the person should be counted to.
 *
 * @param person Person to get status group for
 * @returns Status group of person with highest (i.e. largest) priority. If the person has no status group, `undefined` is returned
 */
export const activeStatusGroup = (person: Person): StatusGroup | undefined =>
  person.statusGroups.toSorted((sg) => sg.priority)[-1]