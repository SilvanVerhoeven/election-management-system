import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Candidate } from "src/types"
import getSubject from "./getSubject"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"

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
      const subject = dbPerson.subjectId
        ? await getSubject({ globalId: dbPerson.subjectId }, ctx)
        : null
      const statusGroups = await getStatusGroupsForPerson(dbPerson.globalId, ctx)

      return {
        ...dbPerson,
        statusGroups,
        subject,
        explicitelyVoteAt: null,
      }
    })
  )
})
