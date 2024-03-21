import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import { Employee, Employment } from "src/types"
import createPerson, { PersonProps } from "./createPerson"
import createEmployment, { EmploymentProps } from "./createEmployment"
import getEmploymentsForPerson from "../queries/getEmploymentsForPerson"
import findStudentStatusGroupForPerson from "../queries/findStudentStatusGroupForPerson"
import findStatusGroup from "../queries/findStatusGroup"

export interface EmployeeProps
  extends Omit<PersonProps, "statusGroupIds">,
    Omit<EmploymentProps, "personId"> {}

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
    const statusGroupIds: number[] = []

    // Add employee status group from position
    const employeeStatusGroup = await findStatusGroup({ position }, ctx)
    if (!!employeeStatusGroup) statusGroupIds.push(employeeStatusGroup.globalId)

    // Add student status group if member to avoid its deletion
    const studentStatusGroup = await findStudentStatusGroupForPerson(
      { externalId: personProps.externalId },
      ctx
    )
    if (!!studentStatusGroup) statusGroupIds.push(studentStatusGroup.globalId)

    const person = await createPerson(
      {
        ...personProps,
        statusGroupIds,
        versionId,
      },
      ctx
    )

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
