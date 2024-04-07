import { readFile } from "fs/promises"
import { getFilePath } from "./files"
import { Upload } from "src/types"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import expressionParser from "docxtemplater/expressions"

const displayList = (input: any, attribute: any) => {
  if (!input) return undefined
  if (!Array.isArray(input)) return attribute ? input[attribute] : input
  return attribute ? input.map((item) => item[attribute]).join(", ") : input.join(", ")
}

/**
 * Generator for a word document based on data and a template.
 *
 * @param data Data formatted to be directly inserted into the given template
 * @param template Template for the word document
 * @returns Word document as Buffer
 */
export const generateWordDocument = async (data: any, template: Upload) => {
  const content = await readFile(getFilePath(template), "binary")

  const zip = new PizZip(content)

  expressionParser.filters["display"] = displayList

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    parser: expressionParser,
  })

  doc.render(data)

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    compression: "DEFLATE",
  })

  // buf is a nodejs Buffer, you can either write it to a
  // file or res.send it with express for example.
  return buf
}
