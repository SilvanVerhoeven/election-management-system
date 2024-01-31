import path from "path"
import { Election, Upload } from "../../types"
import PizZip from "pizzip"
import { getDisplayText as getCommitteeDisplayText } from "src/core/components/displays/CommitteeDisplay"
import { getDisplayText as getStatusGroupDisplayText } from "src/core/components/displays/StatusGroupDisplay"
import { getDisplayText as getConstituencyDisplayText } from "src/core/components/displays/ConstituencyDisplay"

/**
 * Returns root directory of the server.
 */
export const baseDir = () => process.env.ROOT_DIR || process.cwd()

/**
 * Returns base directory of custom files uploaded by the user.
 */
export const filesDir = () => path.join(baseDir(), "uploads")

/**
 * Returns download URL for given upload object.
 */
export const downloadUrl = (upload: Upload) => path.join(`../api/files/${upload.id}`)

/**
 * Returns the path of the actual stored file for a given upload.
 */
export const getFilePath = (upload: Upload) => {
  return path.join(filesDir(), upload.id.toString())
}

/**
 * Saves the given blob locally.
 * May display the save/open dialog of the browser.
 *
 * @param blob Blob to save locally
 * @param contentDisposition Content of the `content-disposition` header of the original response. If given, the blob's filename and type will be set accordingly. Can be retreived via `response.headers.get('content-disposition')`
 */
export const saveBlob = async (blob: Blob, contentDisposition?: string | null) => {
  const downloadUrl = window.URL.createObjectURL(blob)

  let filename = ""
  let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  const matches = filenameRegex.exec(contentDisposition || "")
  if (matches != null && matches[1]) {
    filename = matches[1].replace(/['"]/g, "")
  }

  const hiddenDownloadLink = document.createElement("a")
  hiddenDownloadLink.setAttribute("style", "display: none")
  hiddenDownloadLink.href = downloadUrl
  hiddenDownloadLink.download = filename
  document.body.appendChild(hiddenDownloadLink)

  hiddenDownloadLink.click()

  setTimeout(() => {
    window.URL.revokeObjectURL(downloadUrl)
    hiddenDownloadLink.remove()
  }, 100)
}

/**
 * Return the given election-related files as a .zip.
 *
 * @param elections Elections the files are related to.
 * @param files Files related to the elections. The first file is related to the first election. Elections and Files must have equal length.
 * @param getFullFileName Function to generate the the file's filename, including extension
 * @returns ZIP file as a buffer containing all files
 */
export const zippify = (
  elections: Election[],
  files: Buffer[],
  getFullFileName: (election: Election) => string
): Buffer => {
  const zip = new PizZip()

  for (let i = 0; i < files.length; i++) {
    const election = elections[i]
    const file = files[i]
    if (!!file && !!election) {
      const filename = `${getFullFileName(election)}`
      zip.file(filename, file)
    }
  }

  return zip.generate({ type: "nodebuffer" })
}

/**
 * Returns the identifier of an election in the filename format.
 *
 * @param election Election to get identifier for
 * @returns `[committee]_[constituencies]_[status groups]`
 */
export const getElectionFileName = (election: Election) =>
  `${getCommitteeDisplayText(election.committee)}_${election.constituencies
    .map((c) => getConstituencyDisplayText(c))
    .join("-")}_${election.statusGroups.map((sg) => getStatusGroupDisplayText(sg)).join("-")}`
