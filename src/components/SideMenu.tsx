'use client'

import React, { useState } from 'react'
import {
  SettingOutlined,
  OrderedListOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Layout, Menu } from 'antd'
import Link from 'next/link'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const getItem = (
  href: string | null,
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
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
  getItem(null, 'Konfiguration', 'config', <SettingOutlined />, [
    getItem('/config/templates', 'Vorlagen', 'templates'),
    getItem('/config/basics', 'Eckdaten', 'basics'),
    getItem('/config/faculties', 'Fakultäten', 'faculties'),
    getItem('/config/statusgroups', 'Statusgruppen', 'statusGroups'),
    getItem('/config/constituencies', 'Wahlkreise', 'constituencies'),
    getItem('/config/elections', 'Einzelne Wahlen', 'elections'),
  ]),
  getItem('/count', 'Auszählung', 'count', <OrderedListOutlined />),
]

const CustomHeader = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <div />
      <Menu theme="dark" defaultOpenKeys={['config']} defaultSelectedKeys={['']} mode="inline" items={items} />
    </Sider>
  )
}

export default CustomHeader
