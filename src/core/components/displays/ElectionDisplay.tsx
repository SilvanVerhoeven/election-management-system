import { Election } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"
import { getDisplayText as getCommitteeDisplayText } from "./CommitteeDisplay"
import { getDisplayText as getConstituencyDisplayText } from "./ConstituencyDisplay"
import { getDisplayText as getStatusGroupDisplayText } from "./StatusGroupDisplay"

export interface ElectionDisplayProps extends TextProps {
  election: Election
}

const getText = (election: Election) =>
  `${election.committee.name} - ${election.constituencies
    .map((c) => c.name)
    .join(", ")} - ${election.statusGroups.map((sg) => sg.name).join(", ")}`
const getAbbreveation = (election: Election) =>
  `${getCommitteeDisplayText(election.committee)} - ${election.constituencies
    .map((c) => getConstituencyDisplayText(c))
    .join(", ")} - ${election.statusGroups.map((sg) => getStatusGroupDisplayText(sg)).join(", ")}`

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
