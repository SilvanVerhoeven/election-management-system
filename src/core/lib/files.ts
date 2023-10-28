import path from "path"
import { TemplateTypes } from "./types"

/**
 * Returns root directory of the server.
 */
export const baseDir = () => process.env.ROOT_DIR || process.cwd()

/**
 * Returns base directory of custom files uploaded by the user.
 */
export const filesDir = () => path.join(baseDir(), "uploads")

/**
 * Returns base directory of templates.
 */
export const templatesDir = () => path.join(baseDir(), "templates")

/**
 * Returns download URL for given template ID.
 */
export const downloadUrl = (templateId: TemplateTypes) =>
  path.join(`../api/templates/${templateId}/download/`)

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
