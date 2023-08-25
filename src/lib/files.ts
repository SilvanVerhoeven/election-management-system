import path from "path"
import { TemplateTypes } from "./types"

/**
 * Returns root directory of the server.
 */
export const baseDir = () => process.env.ROOT_DIR || process.cwd()

/**
 * Returns base directory of custom files uploaded by the user.
 */
export const filesDir = () => path.join(baseDir(), 'uploads')

/**
 * Returns base directory of templates.
 */
export const templatesDir = () => path.join(baseDir(), 'templates')

/**
 * Returns download URL for given template ID.
 */
export const downloadUrl = (templateId: TemplateTypes) => path.join(`../api/templates/${templateId}/download/`)