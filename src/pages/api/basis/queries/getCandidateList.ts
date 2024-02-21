import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { CandidateList, CandidateListOrderType } from "src/types"
import getElection from "./getElection"
import getCandidatesForList from "./getCandidatesForList"
import { fullNameLastFirst } from "src/core/lib/person"

export interface GetCandidateProps {
  globalId: number
  versionId?: number
}

/**
 * Returns candidate list with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if candidate list with given properties cannot be found
 * @returns Candidate List of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetCandidateProps, ctx: Ctx): Promise<CandidateList> => {
    const dbList = await db.candidateList.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const candidates = await getCandidatesForList(dbList.globalId, ctx)

    if (dbList.order == CandidateListOrderType.ALPHABETICALLY) {
      candidates.sort((a, b) => fullNameLastFirst(a).localeCompare(fullNameLastFirst(b)))
    }

    return {
      ...dbList,
      order:
        dbList.order == "numeric"
          ? CandidateListOrderType.NUMERIC
          : CandidateListOrderType.ALPHABETICALLY,
      candidatesFor: await getElection({ globalId: dbList.candidatesForId }, ctx),
      candidates,
    }
  }
)
