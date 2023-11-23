import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { TemplateType, Upload, UploadType } from "src/types"

/**
 * Returns the latest template's upload object for the given template type.
 * Returns `null` if there is no template for this upload type.
 */
export default resolver.pipe(async (type: TemplateType, ctx: Ctx): Promise<Upload | null> => {
  return await db.upload.findFirst({
    where: { key: type, type: UploadType.TEMPLATE },
    orderBy: { uploadedAt: "desc" },
  })
})
