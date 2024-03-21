import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import findEnrolment from "./findEnrolment"
import getEmploymentsForPerson from "./getEmploymentsForPerson"
import { Person } from "src/types"

export interface GetPersonProps {
  globalId: number
  versionId?: number
}

/**
 * Returns person with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if person with given properties cannot be found
 * @returns Person of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetPersonProps, ctx: Ctx): Promise<Person> => {
    const dbPerson = await db.person.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const statusGroups = await getStatusGroupsForPerson(dbPerson.globalId, ctx)
    const enrolment = await findEnrolment({ personId: dbPerson.globalId }, ctx)
    const employments = await getEmploymentsForPerson(dbPerson.globalId, ctx)

    return {
      ...dbPerson,
      statusGroups,
      enrolment,
      employments,
    }
  }
)
