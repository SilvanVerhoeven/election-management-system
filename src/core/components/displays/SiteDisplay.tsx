import { Typography } from "antd"
import { Site } from "src/types"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface SiteDisplayProps extends TextProps {
  site: Site
}

export const getDisplayText = (site: Site) => site.shortName ?? site.name

const { Text } = Typography

const SiteDisplay = ({ site, ...textProps }: SiteDisplayProps) => {
  return (
    <>
      {site.shortName ? (
        <Hint hint={site.name}>
          <Text {...textProps}>{getDisplayText(site)}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{getDisplayText(site)}</Text>
      )}
    </>
  )
}

export default SiteDisplay
