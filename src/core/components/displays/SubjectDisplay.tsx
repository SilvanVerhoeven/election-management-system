import { Subject } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"
import { Tag, Typography } from "antd"

export interface SubjectDisplayProps extends TextProps {
  subjects: Subject[] | null | undefined
}

export const getDisplayText = (subjects: Subject[]) => subjects.map(getSingleDisplayText).join(", ")

export const getSingleDisplayText = (subject: Subject | null | undefined) =>
  subject === undefined ? "-" : subject === null ? "Fehlt" : subject.shortName ?? subject.name

const { Text } = Typography

/**
 * Displays given subject
 *
 * @param subject If undefined: Subject assumed to come from employee, displayed as not applicable, valid input. If null: Subject assumed to be missing on a student. If given: Displayed normalls
 * @returns
 */
const SubjectDisplay = ({ subjects, ...textProps }: SubjectDisplayProps) => {
  return subjects === null ? (
    <Text disabled italic>
      Fehlt
    </Text>
  ) : subjects === undefined || subjects.length == 0 ? (
    <Text disabled>-</Text>
  ) : (
    <>
      {subjects.map((subject) => (
        <Tag key={subject.globalId}>
          <AbbreveationDisplay
            text={subject.name}
            abbreveation={subject.shortName}
            {...textProps}
          />
        </Tag>
      ))}
    </>
  )
}

export default SubjectDisplay
