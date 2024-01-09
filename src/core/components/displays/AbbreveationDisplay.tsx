import { Typography } from "antd"
import Hint from "./Hint"
import { TextProps } from "antd/es/typography/Text"

export interface AbbreveationDisplayProps extends TextProps {
  text: string
  abbreveation?: string | null
}

const { Text } = Typography

const AbbreveationDisplay = ({ text, abbreveation, ...textProps }: AbbreveationDisplayProps) => {
  return (
    <>
      {abbreveation ? (
        <Hint hint={text}>
          <Text {...textProps}>{abbreveation}</Text>
        </Hint>
      ) : (
        <Text {...textProps}>{text}</Text>
      )}
    </>
  )
}

export default AbbreveationDisplay
