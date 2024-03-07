import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { ParsedEmployeeData, parseEmployeesCSV } from "src/core/lib/parse/persons"
import { ImportResult, importData } from "src/core/lib/import"
import findAccountUnitMap from "../queries/findAccountUnitMap"
import createEmployee from "./createEmployee"
import deleteOldEmployments from "./deleteOldEmployments"

const importEmployees = async (employees: ParsedEmployeeData[], versionId: number, ctx: Ctx) => {
  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const employee of employees) {
    if (employee.accountingId1.localeCompare(employee.accountingId2) != 0) {
      result.skipped.push({
        label: `[SKIP] ${employee.firstName} ${employee.lastName} (${employee.externalId})`,
        error: `Accounting IDs not identical: '${employee.accountingId1}' vs. '${employee.accountingId2}'`,
      })
      continue
    }

    const unitMap = await findAccountUnitMap({ accountingUnitId: employee.accountingId1 }, ctx)

    if (!unitMap) {
      result.skipped.push({
        label: `[SKIP] ${employee.firstName} ${employee.lastName} (${employee.externalId})`,
        error: `No unit found for accounting ID '${employee.accountingId1}'`,
      })
      continue
    }

    await createEmployee(
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        accountingUnitId: employee.accountingId1,
        employedAtId: unitMap.unitId,
        externalId: employee.externalId,
        position: employee.position,
        versionId,
      },
      ctx
    )

    result.success++
  }

  await deleteOldEmployments({ versionId }, ctx)

  return result
}

/**
 * Imports the election data stored in the upload with the given ID.
 */
export default resolver.pipe(async (uploadId: number, ctx: Ctx) => {
  return await importData(uploadId, parseEmployeesCSV, importEmployees, ctx)
})
