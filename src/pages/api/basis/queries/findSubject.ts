import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Faculty, Subject } from "src/types"
import getUnit from "./getUnit"

export type FindSubjectProps = (
  | {
      externalId: number
    }
  | {
      shortName: string
    }
) & {
  versionId?: number
}

/**
 * Finds a subject with the given data.
 *
 * @param externalId ID of the system exporting the subjects
 * @param shortName Abbreveation of the subject. Works as alternative to the external ID
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if subject with these attributes cannot be found
 * @returns Found subject
 */
export default resolver.pipe(async (props: FindSubjectProps, ctx: Ctx): Promise<Subject> => {
  const dbSubject = await db.subject.findFirstOrThrow({
    where: {
      externalId: "externalId" in props ? props.externalId : undefined,
      shortName: "shortName" in props ? props.shortName : undefined,
      versionId: props.versionId,
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  const faculty = (await getUnit({ globalId: dbSubject.belongsToId }, ctx)) as Faculty

  return {
    ...dbSubject,
    belongsTo: faculty,
  }
})
