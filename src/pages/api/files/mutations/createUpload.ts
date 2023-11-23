import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Upload, UploadType } from "src/types"

export type UploadArgs = {
  filename: string
  type: UploadType
  key?: string
}

/**
 * Create the database representation of an uploaded file.
 *
 * @param filename Original filename of the uploaded file (incl. extension)
 * @param type Type of the uploaded file
 * @param key Optional key to later identify a file or multiple files of the same kind by
 */
export default resolver.pipe(
  async ({ filename, type, key }: UploadArgs, ctx: Ctx): Promise<Upload> => {
    return await db.upload.create({
      data: {
        filename,
        type,
        key,
      },
    })
  }
)
