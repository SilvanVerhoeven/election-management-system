import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Candidate } from "src/types"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import getFaculty from "./getFaculty"
import getSubjectsForPerson from "./getSubjectsForPerson"

export interface GetCandidateProps {
  globalId: number
  versionId?: number
}

/**
 * Returns Candidate with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if candidate with given properties cannot be found
 * @returns Candidate of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetCandidateProps, ctx: Ctx): Promise<Candidate> => {
    const dbPerson = await db.person.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const candidateBase = {
      ...dbPerson,
      statusGroups: await getStatusGroupsForPerson(dbPerson.globalId, ctx),
    }

    // whether dbPerson is a student or an employee
    return dbPerson.matriculationNumber === null
      ? {
          ...candidateBase,
          worksAt: null,
        }
      : {
          ...candidateBase,
          subjects: await getSubjectsForPerson(dbPerson.globalId, ctx),
          explicitelyVoteAt: dbPerson.explicitelyVoteAtId
            ? await getFaculty({ globalId: dbPerson.explicitelyVoteAtId }, ctx)
            : null,
        }
  }
)
