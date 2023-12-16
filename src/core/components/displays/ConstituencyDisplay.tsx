import { Typography } from "antd"
import { Constituency } from "src/types"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface ConstituencyDisplayProps extends TextProps {
  constituency: Constituency
}

export const getDisplayText = (constituency: Constituency) =>
  constituency.shortName ?? constituency.name

const { Text } = Typography

const ConstituencyDisplay = ({ constituency, ...textProps }: ConstituencyDisplayProps) => {
  return (
    <>
      {constituency.shortName ? (
        <Hint hint={constituency.name}>
          <Text {...textProps}>{getDisplayText(constituency)}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{getDisplayText(constituency)}</Text>
      )}
    </>
  )
}

export default ConstituencyDisplay
