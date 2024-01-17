import { resolver } from "@blitzjs/rpc"
import { Ctx, NotFoundError } from "blitz"
import db from "db"
import { Upload } from "src/types"

/**
 * Returns the upload with the given ID.
 * Throws NotFoundError if upload cannot be found.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx): Promise<Upload> => {
  const dbUpload = await db.upload.findUnique({ where: { id: uploadId } })
  if (!dbUpload) throw new NotFoundError()
  if (!dbUpload.versionId) return dbUpload
  const version = await db.version.findUnique({ where: { id: dbUpload.versionId } })
  return {
    ...dbUpload,
    version: version ?? undefined,
  }
})
