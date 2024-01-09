import { Committee } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"

export interface CommitteeDisplayProps extends TextProps {
  committee: Committee
}

export const getDisplayText = (committee: Committee) => committee.shortName ?? committee.name

const CommitteeDisplay = ({ committee, ...textProps }: CommitteeDisplayProps) => {
  return (
    <AbbreveationDisplay text={committee.name} abbreveation={committee.shortName} {...textProps} />
  )
}

export default CommitteeDisplay
