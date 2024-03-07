import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { ParsedAccountUnitMapping, parseAccountingUnitMapXLSX } from "src/core/lib/parse/units"
import { ImportResult, importData } from "src/core/lib/import"
import db from "db"
import findUnit from "../queries/findUnit"
import { UnitType } from "src/types"

const importAccountingUnitMap = async (
  mappings: ParsedAccountUnitMapping[],
  versionId: number,
  ctx: Ctx
) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  const presentIds = (await db.accountUnitMap.findMany({ select: { accountingUnitId: true } })).map(
    (record) => record.accountingUnitId
  )

  await Promise.all(
    mappings.map(async (mapping, index) => {
      try {
        const unit = await findUnit(
          { externalId: mapping.unitExternalId, type: UnitType.DEPARTMENT },
          ctx
        )
        await db.accountUnitMap.create({
          data: { accountingUnitId: mapping.accountingUnitId, unitId: unit.globalId },
        })
        result.success++
      } catch (error) {
        if (error.message.toLowerCase().includes("unique constraint failed")) {
          // Mapping already imported before
          result.success++
          return
        }

        result.error.push({
          label: `[ERR] ${mapping.accountingUnitId} -> ${mapping.unitExternalId} (mapping ${index}/${mappings.length})`,
          error: error.toString(),
        })
      }
    })
  )

  try {
    const idsToDelete = presentIds.filter(
      (id) => !mappings.map((mapping) => mapping.accountingUnitId).includes(id)
    )
    const batchSize = 500
    const batches: string[][] = []
    for (let batchIndex = 0; batchIndex * batchSize < idsToDelete.length; batchIndex++) {
      batches.push(idsToDelete.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize))
    }
    await Promise.all(
      batches.map((batch) =>
        db.accountUnitMap.deleteMany({ where: { accountingUnitId: { in: batch } } })
      )
    )
  } catch (error) {
    result.error.push({
      label: `[ERR] Deletion of old imports failed`,
      error: error.toString(),
    })
  }

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return importData(uploadId, parseAccountingUnitMapXLSX, importAccountingUnitMap, ctx)
})
