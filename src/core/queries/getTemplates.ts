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
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<AnnotatedUpload[]> => {
  return (
    await Promise.all(
      Object.values(templateType).map(async (templateId) => {
        return { id: templateId, upload: await getTemplate(templateId, ctx) }
      })
    )
  ).filter((upload) => !!upload)
})
