import { Election } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"
import { getDisplayText as getCommitteeDisplayText } from "./CommitteeDisplay"
import { getDisplayText as getConstituencyDisplayText } from "./ConstituencyDisplay"
import { getDisplayText as getStatusGroupDisplayText } from "./StatusGroupDisplay"

export interface ElectionDisplayProps extends TextProps {
  election: Election
}

const appendName = (displayText: string, election: Election) =>
  election.name ? displayText + ` (${election.name})` : displayText
const getText = (election: Election) =>
  appendName(
    `${election.committee.name} - ${election.constituencies
      .map((c) => c.name)
      .join(", ")} - ${election.statusGroups.map((sg) => sg.name).join(", ")}`,
    election
  )
const getAbbreveation = (election: Election) =>
  appendName(
    `${getCommitteeDisplayText(election.committee)} - ${election.constituencies
      .map((c) => getConstituencyDisplayText(c))
      .join(", ")} - ${election.statusGroups
      .map((sg) => getStatusGroupDisplayText(sg))
      .join(", ")}`,
    election
  )

export const getDisplayText = getAbbreveation

const ElectionDisplay = ({ election, ...textProps }: ElectionDisplayProps) => {
  return (
    <AbbreveationDisplay
      text={getText(election)}
      abbreveation={getAbbreveation(election)}
      {...textProps}
    />
  )
}

export default ElectionDisplay
