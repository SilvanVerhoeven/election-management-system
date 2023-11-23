import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import fs from "fs/promises"
import { Upload } from "src/types"
import getUpload from "../queries/getUpload"
import { getFilePath } from "src/core/lib/files"

/**
 * Delete the upload with the given ID.
 * Also deletes the file corresponding to the upload.
 *
 * Throws error on failure.
 *
 * @param uplaodId ID of the upload to delete
 * @returns Deleted upload on success
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx): Promise<Upload> => {
  const upload = await getUpload(uploadId, ctx)
  await fs.unlink(getFilePath(upload))
  return await db.upload.delete({ where: { id: upload.id } })
})
