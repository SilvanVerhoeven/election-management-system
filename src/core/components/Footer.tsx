import React from "react"
import { Layout } from "antd"

const { Footer } = Layout

const CustomFooter = ({ children }: { children: React.ReactNode }) => (
  <Footer style={{ textAlign: "center" }}>{children}</Footer>
)

export default CustomFooter
