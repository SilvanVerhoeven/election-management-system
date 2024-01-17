import React, { useState } from "react"
import {
  SettingOutlined,
  OrderedListOutlined,
  ContainerOutlined,
  FileExcelOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu } from "antd"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

const { Sider } = Layout

type MenuItem = Required<MenuProps>["items"][number]

const getItem = (
  href: string | null,
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem => {
  const link = href ? <Link href={href}>{label}</Link> : label
  return {
    key,
    icon,
    children,
    label: link,
  } as MenuItem
}

const items: MenuItem[] = [
  getItem(Routes.HomePage().href, "Basisdaten", "basis", <ContainerOutlined />),
  getItem(Routes.CandidaturesPage().href, "Kandidaturen", "candidatures", <TeamOutlined />),
  getItem(Routes.BallotPage().href, "Stimmzettel", "ballots", <FileExcelOutlined />),
  getItem(Routes.CountPage().href, "Ergebnis", "results", <OrderedListOutlined />),
  getItem(null, "Konfiguration", "config", <SettingOutlined />, [
    getItem(Routes.TemplateConfigPage().href, "Vorlagen", "templates"),
  ]),
]

const CustomHeader = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <div />
      <Menu
        theme="dark"
        defaultOpenKeys={["config"]}
        defaultSelectedKeys={["basis"]}
        mode="inline"
        items={items}
      />
    </Sider>
  )
}

export default CustomHeader
