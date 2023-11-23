import ExcelJS from "exceljs"

const styledRowsMargin = 100 // Number of rows which should be styled below the last row already present in a worksheet
const defaultFont: Partial<ExcelJS.Font> = { name: "Fira Sans" }
const defaultFontBold: Partial<ExcelJS.Font> = { ...defaultFont, name: "Fira Sans Medium" }
const defaultAlignment: Partial<ExcelJS.Alignment> = { vertical: "middle" }
const defaultRowHeight = 20

const defaults = {
  font: defaultFont,
  fontBold: defaultFontBold,
  alignment: defaultAlignment,
  rowHeight: defaultRowHeight,
}

/**
 * Draw a vertical line right of the given column.
 * The line will go along all current rows in the worksheet and additional `styleRowsMargin` number of rows.
 *
 * @param worksheet Worksheet to draw column in
 * @param column Index of the column whose right border should be a line, 1-based
 */
const drawVerticalLine = (worksheet: ExcelJS.Worksheet, column: number) => {
  worksheet
    .getRows(1, worksheet.rowCount + styledRowsMargin)
    ?.forEach((row) => (row.getCell(column).border = { right: { style: "thin" } }))
}

/**
 * Fills a columns with IDs, numbers from 1 to a given maximum.
 *
 * @param worksheet Worksheet to work in
 * @param maximum Maximum number of rows to fill
 * @param column Index of column to fill with IDs
 * @param offset Index of first row to fill
 */
const generateIds = (
  worksheet: ExcelJS.Worksheet,
  maximum: number = 100,
  column: number = 1,
  offset: number = 2
) => {
  worksheet
    .getRows(offset, maximum)
    ?.forEach((row, index) => (row.getCell(column).value = index + 1))
}

/**
 * Apply the default style to all sheets of a workbook.
 * If possible, customly set styles will be kept.
 *
 * @param workbook Workbook to apply style to
 */
const applyDefaultStyle = (workbook: ExcelJS.Workbook) => {
  workbook.eachSheet((sheet) =>
    sheet.getRows(1, sheet.rowCount + styledRowsMargin)?.map((row) => {
      row.font = row.font ? row.font : defaults.font
      row.height = defaults.rowHeight
      row.alignment = row.alignment ? row.alignment : defaults.alignment
    })
  )
}

/**
 * Parses comma-separated list of items into an array of strings.
 * Commonly found in an Excel file.
 *
 * Whitespace around items/between commas/items is removed.
 *
 * @param list Comma-separated list of values
 * @returns Array of items without surrounding whitespace
 */
const parseList = (list: string): string[] => {
  const items = list.split(",").map((item) => item.trim())
  return items
}

export { styledRowsMargin, defaults, drawVerticalLine, applyDefaultStyle, generateIds, parseList }
