import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Person } from "src/types"
import db from "db"
import getPerson from "./getPerson"

/**
 * Returns the latest version of all persons that match the given data.
 *
 * @returns All Persons matching search input
 */
export default resolver.pipe(async (search: string, ctx: Ctx): Promise<Person[]> => {
  if (!search) return []

  const tokens = search.split(" ")
  const searchNamePermutations: any = []

  for (let i = 0; i <= tokens.length; i++) {
    const firstNameTokens = tokens.filter((_, index) => index < i)
    const lastNameTokens = tokens.filter((_, index) => index >= i)
    searchNamePermutations.push({
      firstName: { contains: firstNameTokens.join(" ") },
      lastName: { contains: lastNameTokens.join(" ") },
    })
  }

  const dbPersonIds = await db.person.findMany({
    where: {
      OR: [...searchNamePermutations],
    },
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
    select: { globalId: true },
  })

  const dbEnrolmentIds = (
    await db.enrolment.findMany({
      where: { matriculationNumber: { contains: search } },
      distinct: ["personId"],
      orderBy: { version: { createdAt: "desc" } },
      select: { personId: true, deleted: true },
    })
  ).filter((enrolment) => !enrolment.deleted)

  return await Promise.all(
    [
      ...dbEnrolmentIds.map((enrolment) => enrolment.personId),
      ...dbPersonIds.map((person) => person.globalId),
    ]
      .filter((_, index) => index < 20)
      .map(async (globalId) => getPerson({ globalId }, ctx))
  )
})
