import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import createSubject from "./createSubject"
import findUnit from "../queries/findUnit"
import { distinct } from "src/core/lib/array"
import { Unit } from "src/types"
import { ParsedSubjectData, parseSubjectsXLSX } from "src/core/lib/parse/subjects"
import { ImportResult, importData, returnNullOnError } from "src/core/lib/import"

const importSubjects = async (subjects: ParsedSubjectData[], versionId: number, ctx: Ctx) => {
  const distinctUnitIds = subjects.map((subject) => subject.unitId).filter(distinct)
  const units = (
    await Promise.all(
      distinctUnitIds.map(async (id) => returnNullOnError(() => findUnit({ externalId: id }, ctx)))
    )
  ).filter((unit) => !!unit) as Unit[]

  const result: ImportResult = {
    success: 0,
    skipped: [],
    error: [],
  }

  for (const subject of subjects) {
    const unit = units.find((unit) => unit.externalId === subject.unitId)

    if (!unit) {
      result.skipped.push({
        label: `[SKIP] ${subject.name} (${subject.shortName}, ${subject.externalId})`,
        error: `No unit found with ${subject.unitId}`,
      })
      continue
    }

    try {
      await createSubject(
        {
          externalId: subject.externalId,
          name: subject.name,
          shortName: subject.shortName,
          belongsToId: unit.globalId,
          versionId,
        },
        ctx
      )

      result.success++
    } catch (error) {
      result.error.push({
        label: `[ERR] ${subject.name} (${subject.shortName}, ${subject.externalId})`,
        error: error.message,
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
  return importData(uploadId, parseSubjectsXLSX, importSubjects, ctx)
})
