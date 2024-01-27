import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Candidate } from "src/types"
import getSubject from "./getSubject"
import getStatusGroupsForPerson from "./getStatusGroupsForPerson"
import getFaculty from "./getFaculty"

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

    return {
      ...dbPerson,
      subject: dbPerson.subjectId ? await getSubject({ globalId: dbPerson.subjectId }, ctx) : null,
      statusGroups: await getStatusGroupsForPerson(dbPerson.globalId, ctx),
      explicitelyVoteAt: dbPerson.explicitelyVoteAtId
        ? await getFaculty({ globalId: dbPerson.explicitelyVoteAtId }, ctx)
        : null,
    }
  }
)
