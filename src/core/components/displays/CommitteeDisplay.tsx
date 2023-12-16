import { Typography } from "antd"
import { Committee } from "src/types"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface CommitteeDisplayProps extends TextProps {
  committee: Committee
}

export const getDisplayText = (committee: Committee) => committee.shortName ?? committee.name

const { Text } = Typography

const CommitteeDisplay = ({ committee, ...textProps }: CommitteeDisplayProps) => {
  return (
    <>
      {committee.shortName ? (
        <Hint hint={committee.name}>
          <Text {...textProps}>{getDisplayText(committee)}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{getDisplayText(committee)}</Text>
      )}
    </>
  )
}

export default CommitteeDisplay
