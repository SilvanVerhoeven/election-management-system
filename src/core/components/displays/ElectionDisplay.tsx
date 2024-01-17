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
  `${election.committee.name} - ${election.constituencies[0]?.name} - ${election.statusGroups[0]?.name}`
const getAbbreveation = (election: Election) =>
  `${getCommitteeDisplayText(election.committee)} - ${
    election.constituencies[0] ? getConstituencyDisplayText(election.constituencies[0]) : "/"
  } - ${election.statusGroups[0] ? getStatusGroupDisplayText(election.statusGroups[0]) : "/"}`

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
