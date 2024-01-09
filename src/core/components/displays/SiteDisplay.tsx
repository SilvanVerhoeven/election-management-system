import { Site } from "src/types"
import { TextProps } from "antd/es/typography/Text"
import AbbreveationDisplay from "./AbbreveationDisplay"

export interface SiteDisplayProps extends TextProps {
  site: Site
}

const SiteDisplay = ({ site, ...textProps }: SiteDisplayProps) => {
  return <AbbreveationDisplay text={site.name} abbreveation={site.shortName} {...textProps} />
}

export default SiteDisplay
