import React from "react"
import { Layout, theme } from "antd"

const { Content } = Layout

const CustomContent = ({ children }: { children: React.ReactNode }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  return (
    <Content style={{ margin: "16px" }}>
      <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>{children}</div>
    </Content>
  )
}

export default CustomContent
