import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { ParsedUnitData, parseFacultyCSV } from "src/core/lib/parse/units"
import { ImportResult, importData } from "src/core/lib/import"
import createUnit from "./createUnit"
import { UnitType } from "src/types"

const importFaculties = async (units: ParsedUnitData[], versionId: number, ctx: Ctx) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const unit of units) {
    try {
      await createUnit(
        {
          type: UnitType.FACULTY,
          externalId: unit.externalId,
          name: unit.name,
          shortName: unit.shortName,
          versionId,
        },
        ctx
      )

      result.success++
    } catch (error) {
      result.error.push({
        label: `${unit.name} (${unit.shortName}, ${unit.externalId})`,
        error,
      })
      continue
    }
  }

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return importData(uploadId, parseFacultyCSV, importFaculties, ctx)
})
