import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Student } from "src/types"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import getSubject from "./getSubject"
import getFaculty from "./getFaculty"

export interface FindSiteProps {
  matriculationNumber: string
  versionId?: number
}

/**
 * Finds a student with the given data.
 *
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if site with these attributes cannot be found
 * @returns Found site
 */
export default resolver.pipe(
  async ({ matriculationNumber, versionId }: FindSiteProps, ctx: Ctx): Promise<Student | null> => {
    const match = await db.person.findFirst({
      where: {
        matriculationNumber,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (!match) return null

    const statusGroups = await getStatusGroupsForPerson(match.globalId, ctx)
    const subject = !!match.subjectId ? await getSubject({ globalId: match.subjectId }, ctx) : null
    const explicitelyVoteAt = !!match.explicitelyVoteAtId
      ? await getFaculty({ globalId: match.explicitelyVoteAtId }, ctx)
      : null

    return {
      ...match,
      statusGroups,
      subject,
      explicitelyVoteAt,
    }
  }
)
