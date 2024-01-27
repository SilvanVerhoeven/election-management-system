import { Subject } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"
import { Typography } from "antd"

export interface SubjectDisplayProps extends TextProps {
  subject: Subject | null | undefined
}

export const getDisplayText = (subject: Subject | null | undefined) =>
  subject === undefined ? "-" : subject === null ? "Fehlt" : subject.shortName ?? subject.name

const { Text } = Typography

/**
 * Displays given subject
 *
 * @param subject If undefined: Subject assumed to come from employee, displayed as not applicable, valid input. If null: Subject assumed to be missing on a student. If given: Displayed normalls
 * @returns
 */
const SubjectDisplay = ({ subject, ...textProps }: SubjectDisplayProps) => {
  return subject === undefined ? (
    <Text disabled>-</Text>
  ) : subject === null ? (
    <Text disabled italic>
      Fehlt
    </Text>
  ) : (
    <AbbreveationDisplay text={subject.name} abbreveation={subject.shortName} {...textProps} />
  )
}

export default SubjectDisplay
