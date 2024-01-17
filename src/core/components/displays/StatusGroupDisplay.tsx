import { StatusGroup } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"

export interface StatusGroupDisplayProps extends TextProps {
  statusGroup: StatusGroup
}

export const getDisplayText = (statusGroup: StatusGroup) =>
  statusGroup.shortName ?? statusGroup.name

const StatusGroupDisplay = ({ statusGroup, ...textProps }: StatusGroupDisplayProps) => {
  return (
    <AbbreveationDisplay
      text={statusGroup.name}
      abbreveation={statusGroup.shortName}
      {...textProps}
    />
  )
}

export default StatusGroupDisplay
