import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Student } from "src/types"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import getFaculty from "./getFaculty"
import getSubjectsForPerson from "./getSubjectsForPerson"

export interface FindStudentProps {
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
  async (
    { matriculationNumber, versionId }: FindStudentProps,
    ctx: Ctx
  ): Promise<Student | null> => {
    const match = await db.person.findFirst({
      where: {
        matriculationNumber,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (!match) return null

    const statusGroups = await getStatusGroupsForPerson(match.globalId, ctx)
    const subjects = await getSubjectsForPerson(match.globalId, ctx)
    const explicitelyVoteAt = !!match.explicitelyVoteAtId
      ? await getFaculty({ globalId: match.explicitelyVoteAtId }, ctx)
      : null

    return {
      ...match,
      statusGroups,
      subjects,
      explicitelyVoteAt,
    }
  }
)
