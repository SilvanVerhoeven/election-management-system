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

export { styledRowsMargin, defaults, drawVerticalLine, applyDefaultStyle }
