import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import { Person } from "src/types"
import findEnrolment from "./findEnrolment"
import getEmploymentsForPerson from "./getEmploymentsForPerson"

/**
 * Returns the latest version of all persons.
 *
 * @returns All Persons
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Person[]> => {
  const dbPersons = await db.person.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })

  return await Promise.all(
    dbPersons.map(async (dbPerson) => {
      const statusGroups = await getStatusGroupsForPerson(dbPerson.globalId, ctx)
      const enrolment = await findEnrolment({ personId: dbPerson.globalId }, ctx)
      const employments = await getEmploymentsForPerson(dbPerson.globalId, ctx)

      return {
        ...dbPerson,
        statusGroups,
        enrolment,
        employments,
      }
    })
  )
})
