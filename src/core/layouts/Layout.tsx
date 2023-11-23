import React, { Suspense } from "react"
import StyledComponentsRegistry from "../lib/AntdRegistry"
import { ConfigProvider, Layout as AntdLayout, Spin } from "antd"
import SideMenu from "src/core/components/SideMenu"
import Footer from "src/core/components/Footer"
import Content from "src/core/components/Content"
import theme from "src/theme/themeConfig"
import Head from "next/head"
import { BlitzLayout } from "@blitzjs/next"

export const metadata = {
  title: "Election Management System",
  description: "",
}

/**
 * Fallback component for Suspense. Displays loading spinner.
 */
export const SuspenseSpinner = () => <Spin spinning />

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <>
      <Head>
        <title>EMS - {title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AntdLayout style={{ minHeight: "100vh" }}>
        <SideMenu></SideMenu>
        <AntdLayout>
          {/* <Header /> */}
          <Content>
            <StyledComponentsRegistry>
              <ConfigProvider theme={theme}>
                <Suspense fallback={<SuspenseSpinner />}>{children}</Suspense>
              </ConfigProvider>
            </StyledComponentsRegistry>
          </Content>
          <Footer>{metadata.title}</Footer>
        </AntdLayout>
      </AntdLayout>
    </>
  )
}

export default Layout
