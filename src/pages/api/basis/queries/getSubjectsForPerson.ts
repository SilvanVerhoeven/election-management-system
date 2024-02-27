import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Subject } from "src/types"
import getSubject from "./getSubject"

/**
 * Returns the latest version of subjects the person with the given globalId is member of.
 *
 * @returns Subjects of given person
 */
export default resolver.pipe(async (personGlobalId: number, ctx: Ctx): Promise<Subject[]> => {
  const dbConnections = await db.subjectOccupancy.findMany({
    distinct: ["subjectId"],
    where: {
      personId: personGlobalId,
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  return await Promise.all(
    dbConnections
      .filter((connection) => !connection.deleted)
      .map(async (dbConnection) => await getSubject({ globalId: dbConnection.subjectId }, ctx))
  )
})
