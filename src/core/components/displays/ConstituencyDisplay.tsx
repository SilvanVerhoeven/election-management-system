import { Constituency } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"

export interface ConstituencyDisplayProps extends TextProps {
  constituency: Constituency
}

export const getDisplayText = (constituency: Constituency) =>
  constituency.shortName ?? constituency.name

const ConstituencyDisplay = ({ constituency, ...textProps }: ConstituencyDisplayProps) => {
  return (
    <AbbreveationDisplay
      text={constituency.name}
      abbreveation={constituency.shortName}
      {...textProps}
    />
  )
}

export default ConstituencyDisplay
