import React, { useState } from "react"
import { UploadOutlined } from "@ant-design/icons"
import { Upload as UploadComponent, Typography, Button, Space, Tabs } from "antd"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { TabsProps, UploadFile } from "antd/lib"
import CandidateListTable from "src/core/components/tables/CandidateListTable"
import CandidateTable from "src/core/components/tables/CandidateTable"
import useUpload from "src/core/hooks/useUpload"
import { UploadChangeParam } from "antd/es/upload"

const { Title, Text } = Typography

const CandidaturesPage: BlitzPage = () => {
  const {
    isUploading,
    handleFileChange: _handleFileChange,
    uploadFile,
    messageApi,
    contextHolder,
  } = useUpload()

  const [isUpdating, setIsUpdating] = useState(false)

  const handleFileChange = async (change: UploadChangeParam<UploadFile>) =>
    _handleFileChange(
      change,
      async () => {
        //await updateDisplay()
        void messageApi.success(`Upload erfolgreich`)
      },
      async (_, error) => {
        console.error(error)
        void messageApi.error(
          <>
            <Text strong>Upload fehlgeschlagen</Text>
            <br />
            <Text>{`${error}`}</Text>
          </>,
          10
        )
      }
    )

  const items: TabsProps["items"] = [
    {
      key: "candidates",
      label: "Kandidierende",
      children: <CandidateTable data={[]} />,
    },
    {
      key: "lists",
      label: "Listen",
      children: <CandidateListTable data={[]} />,
    },
  ]

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Kandidaturen</Title>
      <Space wrap>
        <UploadComponent
          action="/api/import/persons"
          maxCount={1}
          showUploadList={false}
          onChange={handleFileChange}
          customRequest={(options) => uploadFile(options, "persons")}
          accept=".csv"
        >
          <Button icon={<UploadOutlined />} loading={isUploading || isUpdating}>
            Importieren
          </Button>
        </UploadComponent>
      </Space>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  )
}

CandidaturesPage.getLayout = (page) => <Layout title="Listen">{page}</Layout>

export default CandidaturesPage
