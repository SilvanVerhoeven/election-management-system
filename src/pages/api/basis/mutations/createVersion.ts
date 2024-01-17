import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Version } from "src/types"

export interface VersionProps {
  name?: string
  uploadId?: number
}

/**
 * Creates a new version.
 *
 * @returns Newly created version
 */
export default resolver.pipe(
  async ({ name, uploadId }: VersionProps, ctx: Ctx): Promise<Version> => {
    return await db.version.create({
      data: {
        name: name ?? null,
        Upload: uploadId ? { connect: { id: uploadId } } : undefined,
      },
    })
  }
)
