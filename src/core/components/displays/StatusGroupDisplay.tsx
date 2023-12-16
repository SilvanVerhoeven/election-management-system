import { Typography } from "antd"
import { StatusGroup } from "src/types"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface StatusGroupDisplayProps extends TextProps {
  statusGroup: StatusGroup
}

export const getDisplayText = (statusGroup: StatusGroup) =>
  statusGroup.shortName ?? statusGroup.name

const { Text } = Typography

const StatusGroupDisplay = ({ statusGroup, ...textProps }: StatusGroupDisplayProps) => {
  return (
    <>
      {statusGroup.shortName ? (
        <Hint hint={statusGroup.name}>
          <Text {...textProps}>{getDisplayText(statusGroup)}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{getDisplayText(statusGroup)}</Text>
      )}
    </>
  )
}

export default StatusGroupDisplay
