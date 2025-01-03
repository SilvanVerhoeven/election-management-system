import { PollingStation } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"

export interface PollingStationDisplayProps extends TextProps {
  pollingStation: PollingStation
}

export const getDisplayText = (pollingStation: PollingStation) =>
  pollingStation.shortName ?? pollingStation.name

const PollingStationDisplay = ({ pollingStation, ...textProps }: PollingStationDisplayProps) => {
  return (
    <AbbreveationDisplay
      text={pollingStation.name}
      abbreveation={pollingStation.shortName}
      {...textProps}
    />
  )
}

export default PollingStationDisplay
