import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Enrolment, Faculty } from "src/types"
import getSubjectsForEnrolment from "./getSubjectsForEnrolment"
import getUnit from "./getUnit"

export type FindEnrolmentProps = (
  | {
      personId: number
    }
  | {
      matriculationNumber: string
    }
) & {
  versionId?: number
}

/**
 * Finds an enrolment with the given data.
 *
 * @param personId Global ID of the person with this enrolment
 * @param matriculationNumber Matriculation number of the person with this enrolment
 * @param versionId ID of the wanted version. Defaults to the latest
 * @returns Found Enrolment, null if none can be found
 */
export default resolver.pipe(
  async (props: FindEnrolmentProps, ctx: Ctx): Promise<Enrolment | null> => {
    const dbEnrolment = await db.enrolment.findFirst({
      where: {
        personId: "personId" in props ? props.personId : undefined,
        matriculationNumber: "matriculationNumber" in props ? props.matriculationNumber : undefined,
        versionId: props.versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (!dbEnrolment) return null

    const subjects = await getSubjectsForEnrolment(dbEnrolment.globalId, ctx)

    const explicitelyVoteAt = dbEnrolment.explicitelyVoteAtId
      ? ((await getUnit({ globalId: dbEnrolment.explicitelyVoteAtId }, ctx)) as Faculty)
      : null

    return {
      ...dbEnrolment,
      explicitelyVoteAt,
      subjects,
    }
  }
)
