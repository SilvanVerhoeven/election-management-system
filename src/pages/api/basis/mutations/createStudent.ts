import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Enrolment, Student } from "src/types"
import createPerson, { PersonProps } from "./createPerson"
import createEnrolment, { EnrolmentProps } from "./createEnrolment"

export interface StudentProps extends PersonProps, Omit<EnrolmentProps, "personId"> {}

/**
 * Creates a new student candidate, unless it matches another student candidate completely.
 *
 * @returns Newly created or matching student candidate in the bare DB form
 */
export default resolver.pipe(
  async (
    {
      matriculationNumber,
      subjectIds,
      explicitelyVoteAtId,
      versionId,
      ...personProps
    }: StudentProps,
    ctx: Ctx
  ): Promise<Student> => {
    const person = await createPerson({ ...personProps, versionId }, ctx)
    const enrolment = (await createEnrolment(
      {
        personId: person.globalId,
        matriculationNumber,
        subjectIds,
        explicitelyVoteAtId,
        versionId,
      },
      ctx
    )) as Enrolment

    // Student is only a compound of person and enrolment. Further object creations are not necessary

    return {
      ...person,
      enrolment,
    }
  }
)
