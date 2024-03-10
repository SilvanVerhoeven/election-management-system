import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { StatusGroup } from "src/types"
import findPerson from "./findPerson"
import { isStudentStatusGroup } from "src/core/lib/person"

export interface FindStudentStatusGroupProps {
  externalId: string
  versionId?: number
}

/**
 * Returns student status group if the given person is member of it.
 *
 * @param externalId person ID of the system exporting the persons
 * @param versionId ID of the person in question
 * @returns Found student status group or null, if person is not found or no member
 */
export default resolver.pipe(
  async (
    { externalId, versionId }: FindStudentStatusGroupProps,
    ctx: Ctx
  ): Promise<StatusGroup | null> => {
    const person = await findPerson({ externalId, versionId }, ctx)

    if (!person) return null

    const studentStatusGroups = person.statusGroups.filter(isStudentStatusGroup)

    return studentStatusGroups.length > 0 ? studentStatusGroups[0]! : null
  }
)
