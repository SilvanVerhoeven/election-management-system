import { Tooltip } from "antd"
import { PropsWithChildren } from "react"

export interface HintProps extends PropsWithChildren {
  hint: string
}

const Hint = (props: HintProps) => {
  return (
    <Tooltip placement="bottom" title={props.hint} arrow>
      <span
        style={{
          textDecorationLine: "underline",
          textDecorationStyle: "dotted",
          cursor: "pointer",
        }}
      >
        {props.children}
      </span>
    </Tooltip>
  )
}

export default Hint
