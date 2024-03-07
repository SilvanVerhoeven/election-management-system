import { api } from "src/blitz-server"
import { handleFileUpload } from "../files/upload"
import importEmployees from "../basis/mutations/importEmployees"

/**
 * Import employees.
 * Request must contain employee CSV file.
 * More details: see `handleFileUpload` method.
 */
const handler = api(async (req, res, ctx) => {
  try {
    const upload = await handleFileUpload(req, res, ctx)

    try {
      res.status(200).json(await importEmployees(upload.id, ctx))
    } catch (error) {
      throw {
        statusCode: 400,
        ...error,
        message: "DB import failed: " + error.message,
      }
    }
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
