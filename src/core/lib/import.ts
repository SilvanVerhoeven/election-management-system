import { Ctx } from "blitz"
import getUpload from "src/pages/api/files/queries/getUpload"
import { getFilePath } from "./files"
import { readFile } from "fs/promises"
import createVersion from "src/pages/api/basis/mutations/createVersion"

export interface ImportResult {
  success: number
  skipped: { label: string; error: string }[]
  error: { label: string; error: string }[]
}

/**
 * Helper that awaits an async function. On success, it returns the result. On error, it resolves to null.
 *
 * @param handler Handler to be awaited
 * @returns Handler result on success, `null` otherwise
 */
export const returnNullOnError = async <T>(handler: () => Promise<T>): Promise<T | null> => {
  try {
    return await handler()
  } catch (error) {
    return null
  }
}
/**
 * General handle to parse and import data from uploaded file.
 */
export const importData = async <T>(
  uploadId: number,
  parseHandler: (buffer: Buffer) => Promise<T>,
  importHandler: (data: T, versionId: number, ctx: Ctx) => Promise<ImportResult>,
  ctx: Ctx
): Promise<ImportResult> => {
  const upload = await getUpload(uploadId, ctx)
  const buffer = await readFile(getFilePath(upload))
  const parsedUnits = await parseHandler(buffer)

  const version = await createVersion({ uploadId: upload.id }, ctx)

  return await importHandler(parsedUnits, version.id, ctx)
}
