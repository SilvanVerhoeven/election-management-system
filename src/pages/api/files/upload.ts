import busboy from "busboy"
import { join } from "path"
import { mkdir, stat } from "fs/promises"
import { filesDir } from "src/core/lib/files"
import createUpload from "./mutations/createUpload"
import { Upload, UploadType } from "src/types"
import { api } from "src/blitz-server"
import { createWriteStream } from "fs"
import stream from "stream/promises"
import { NextApiRequest } from "next"
import { BlitzNextApiResponse } from "@blitzjs/next"
import { Ctx } from "blitz"
import deleteUpload from "./mutations/deleteUpload"
import SuperJson from "superjson"
import importElection from "../basis/mutations/importElection"

export class UploadError extends Error {
  name = "UploadError"
  statusCode: number
  upload: Upload | undefined | null

  constructor(statusCode: number, message: string, upload?: Upload | null) {
    super(message)
    this.statusCode = statusCode
    this.upload = upload
  }
}
// Register with SuperJson serializer so it's reconstructed on the client
SuperJson.registerClass(UploadError)
SuperJson.allowErrorProps("statusCode")
SuperJson.allowErrorProps("upload")

/**
 * Handle the request to upload one new file.
 * May only be used within an API handler.
 * Incoming request must be a POST request.
 *
 * Throws HTTPError failure.
 *
 * Expected form-data content (in that order):
 *   - "type" (optional): "template" or "data" (default)
 *   - "key" (optional): identifier to retrieve this upload or uploads of the same kind by
 *   - "file": file to upload
 *
 * We receive the file as a stream in form-data format (https://developer.mozilla.org/en-US/docs/Web/API/FormData).
 * Receiving it as a stream allows us to save the content directly on the disk,
 *   we don't need to fit the whole file into the memory.
 *
 * @param req Request object, must be a POST request
 * @param res Response object
 * @param ctx Blitz Context for API route calls
 * @returns On success: Created upload object corresponding to the uploaded file. On failure: HTTPError or Error.
 */
export const handleFileUpload = async (
  req: NextApiRequest,
  res: BlitzNextApiResponse,
  ctx: Ctx
) => {
  if (req.method !== "POST") throw new UploadError(403, "This must be a POST request")

  /**
   * Errors thrown within the parser's functions are not catched by the `.catch()` in `handler` and would lead to a server crash.
   * That's why we use the `parserError` object to pass error information to the parser's outside context.
   */
  let parserError: Error | null = null

  let type: UploadType = UploadType.DATA
  let key: string | undefined = undefined
  let upload: Upload | null = null

  const cleanup = async (uploadId: number) => await deleteUpload(uploadId, ctx)

  const formDataParser = busboy({ headers: req.headers })

  formDataParser.on("field", (name: string, value: string) => {
    if (name === "type") {
      type = value as UploadType
    } else if (name === "key") {
      key = value
    }
  })

  formDataParser.on("file", async (fieldname, filestream, fileinfo) => {
    try {
      const { filename: latin1Filename } = fileinfo
      const originalFilename = Buffer.from(latin1Filename, "latin1").toString("utf8")

      try {
        await stat(filesDir())
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(filesDir(), { recursive: true })
        } else {
          filestream.destroy()
          throw new UploadError(500, e)
        }
      }

      upload = await createUpload({ filename: originalFilename, type, key }, ctx)
      const filePath = join(filesDir(), upload.id.toString())

      const output = createWriteStream(filePath, { autoClose: true })
      await stream.pipeline(filestream, output)
    } catch (error) {
      if (error.statusCode) {
        parserError = error
      } else {
        parserError = new UploadError(500, `Error when processing file: ${error}`)
      }
      filestream.destroy()
    }
  })

  /**
   * All errors thrown here are catched by the `.catch()` in `handler`.
   * They preceed `outputError`.
   */
  try {
    await stream.pipeline(req, formDataParser)
  } catch (error) {
    if (!!(upload as unknown as Upload | null)) await cleanup(upload!.id)
    throw {
      statusCode: 500,
      ...error,
      message: "Error when parsing request: " + error.message,
      upload,
    }
  }

  if (parserError) {
    if (!!(upload as unknown as Upload | null)) await cleanup(upload!.id)
    throw parserError
  }

  if (!upload && !parserError) throw new UploadError(400, "File missing in request")

  return upload as unknown as Upload
}

const handler = api(async (req, res, ctx) => {
  try {
    const upload = await handleFileUpload(req, res, ctx)
    res.status(200).json(upload)
  } catch (error) {
    res.status(error.statusCode ?? 500).end(error.message)
  }
})

export default handler

/**
 * Busboy requires the request to come as a stream. Next.js (and thus Blitz.js)
 *   parses the request body and returns it as a string.
 * To be able to use Busboy, we need to disallow the body parsing.
 *
 * See https://nextjs.org/docs/api-routes/request-helpers#custom-config
 */
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
}
