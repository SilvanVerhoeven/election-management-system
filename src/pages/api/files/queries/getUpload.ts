import { resolver } from "@blitzjs/rpc"
import { Ctx, NotFoundError } from "blitz"
import db from "db"

/**
 * Returns the upload with the given ID.
 * Throws NotFoundError if upload cannot be found.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  const dbUpload = await db.upload.findUnique({ where: { id: uploadId } })
  if (!dbUpload) throw new NotFoundError()
  return dbUpload
})
