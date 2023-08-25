import React from 'react'
import { Inter } from 'next/font/google'
import StyledComponentsRegistry from '../lib/AntdRegistry'
import { ConfigProvider, Layout } from 'antd'
import SideMenu from '@/components/SideMenu'
import Footer from '@/components/Footer'
import Content from '@/components/Content'
import theme from '@/theme/themeConfig'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Election Management System',
  description: '',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={inter.className} style={{ margin: 0 }}>
      <Layout style={{ minHeight: '100vh' }}>
        <SideMenu></SideMenu>
        <Layout>
          {/* <Header /> */}
          <Content>
            <StyledComponentsRegistry>
              <ConfigProvider theme={theme}>
                {children}
              </ConfigProvider></StyledComponentsRegistry>
          </Content>
          <Footer>{metadata.title}</Footer>
        </Layout>
      </Layout>
    </body>
  </html>
)

export default RootLayout