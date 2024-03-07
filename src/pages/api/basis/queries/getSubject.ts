import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Faculty, Subject } from "src/types"
import getUnit from "./getUnit"

export interface GetSubjectProps {
  globalId: number
  versionId?: number
}

/**
 * Returns subject with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @throws NotFoundError if subject with given properties cannot be found
 * @returns Subject of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetSubjectProps, ctx: Ctx): Promise<Subject> => {
    const subject = await db.subject.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const faculty = (await getUnit({ globalId: subject.belongsToId }, ctx)) as Faculty

    return {
      ...subject,
      belongsTo: faculty,
    }
  }
)
