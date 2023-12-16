import { Typography } from "antd"
import { PollingStation } from "src/types"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface PollingStationDisplayProps extends TextProps {
  pollingStation: PollingStation
}

export const getDisplayText = (pollingStation: PollingStation) =>
  pollingStation.shortName ?? pollingStation.name

const { Text } = Typography

const PollingStationDisplay = ({ pollingStation, ...textProps }: PollingStationDisplayProps) => {
  return (
    <>
      {pollingStation.shortName ? (
        <Hint hint={pollingStation.name}>
          <Text {...textProps}>{getDisplayText(pollingStation)}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{getDisplayText(pollingStation)}</Text>
      )}
    </>
  )
}

export default PollingStationDisplay
