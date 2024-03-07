import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Employee, Employment } from "src/types"
import createPerson, { PersonProps } from "./createPerson"
import createEmployment, { EmploymentProps } from "./createEmployment"
import getEmploymentsForPerson from "../queries/getEmploymentsForPerson"

export interface EmployeeProps extends PersonProps, Omit<EmploymentProps, "personId"> {}

/**
 * Creates a new student candidate, unless it matches another student candidate completely.
 *
 * @returns Newly created or matching student candidate in the bare DB form
 */
export default resolver.pipe(
  async (
    { versionId, accountingUnitId, employedAtId, position, ...personProps }: EmployeeProps,
    ctx: Ctx
  ): Promise<Employee> => {
    const person = await createPerson({ ...personProps, versionId }, ctx)
    const employment = (await createEmployment(
      {
        personId: person.globalId,
        accountingUnitId,
        employedAtId,
        position,
        versionId,
      },
      ctx
    )) as Employment

    // Employee is only a compound of person and employments. Further object creations are not necessary

    const storedEmployments = await getEmploymentsForPerson(person.globalId, ctx) // done to satisfy TS compiler

    return {
      ...person,
      employments: [
        employment,
        ...storedEmployments.filter((e) => e.globalId == employment.globalId),
      ],
    }
  }
)
