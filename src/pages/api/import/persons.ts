import { api } from "src/blitz-server"
import { handleFileUpload } from "../files/upload"
import importPersons from "../basis/mutations/importPersons"

/**
 * Import persons.
 * Result must contain person excel file.
 * More details: see `handleFileUpload` method.
 */
const handler = api(async (req, res, ctx) => {
  try {
    const upload = await handleFileUpload(req, res, ctx)

    try {
      // Was passiert, wenn nach dem Import von Personen Basisdaten neu importiert werden? --> versioning issue nutzen, ggf. muss eine versionsübergreifende ID für ein Objekt her
      // dann Import von Personen bauen
      await importPersons(upload.id, ctx)
    } catch (error) {
      throw {
        statusCode: 400,
        ...error,
        message: "DB import failed: " + error.message,
      }
    }

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
