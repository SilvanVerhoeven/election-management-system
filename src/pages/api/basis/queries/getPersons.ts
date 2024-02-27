import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Candidate } from "src/types"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import getSubjectsForPerson from "./getSubjectsForPerson"

/**
 * Returns the latest version of all persons.
 *
 * @returns All Persons
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Candidate[]> => {
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
      const subjects = await getSubjectsForPerson(dbPerson.globalId, ctx)
      const statusGroups = await getStatusGroupsForPerson(dbPerson.globalId, ctx)

      return {
        ...dbPerson,
        statusGroups,
        subjects,
        explicitelyVoteAt: null,
      }
    })
  )
})
