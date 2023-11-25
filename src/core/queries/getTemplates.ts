import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { TemplateType, Upload, templateType } from "src/types"
import getTemplate from "./getTemplate"

export type AnnotatedUpload = {
  id: TemplateType
  upload: Upload | null
}

/**
 * Returns the latest upload objects for all template types with uploads.
 * @param includeUnset Include templates without uploads, returned null for those.
 */
export default resolver.pipe(
  async (includeUnset: boolean | null, ctx: Ctx): Promise<AnnotatedUpload[]> => {
    const templates = await Promise.all(
      Object.values(templateType).map(async (templateId) => {
        return { id: templateId, upload: await getTemplate(templateId, ctx) }
      })
    )

    return includeUnset ? templates : templates.filter((upload) => !!upload)
  }
)
