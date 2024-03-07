import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Person } from "src/types"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import findEnrolment from "./findEnrolment"
import getEmploymentsForPerson from "./getEmploymentsForPerson"

export interface FindPersonProps {
  externalId: string
  versionId?: number
}

/**
 * Finds a person with the given data.
 *
 * @param versionId ID of the wanted version. Defaults to the latest
 * @returns Found student or `null`, if student was not found
 */
export default resolver.pipe(
  async ({ externalId, versionId }: FindPersonProps, ctx: Ctx): Promise<Person | null> => {
    const match = await db.person.findFirst({
      where: {
        externalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (!match) return null

    const statusGroups = await getStatusGroupsForPerson(match.globalId, ctx)
    const enrolment = await findEnrolment({ personId: match.globalId }, ctx)
    const employments = await getEmploymentsForPerson(match.globalId, ctx)

    return {
      ...match,
      statusGroups,
      employments,
      enrolment,
    }
  }
)
