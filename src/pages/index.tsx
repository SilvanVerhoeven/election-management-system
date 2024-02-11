import React, { useCallback, useEffect, useState } from "react"
import {
  Button,
  Form,
  Input,
  Space,
  Tabs,
  Upload as UploadComponent,
  DatePicker,
  Row,
  Col,
  Typography,
} from "antd"
import type { TabsProps, UploadFile } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import ConstituencyTable from "src/core/components/tables/ConstituencyTable"
import StatusGroupTable from "src/core/components/tables/StatusGroupTable"
import ElectionTable from "src/core/components/tables/ElectionTable"
import { saveBlob } from "src/core/lib/files"
import Title from "antd/lib/typography/Title"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { UploadChangeParam } from "antd/es/upload"
import { Basis } from "src/types"
import { useQuery } from "@blitzjs/rpc"
import dayjs from "dayjs"
import SiteTable from "src/core/components/tables/SiteTable"
import getBasis from "./api/basis/queries/getBasis"
import PollingStationTable from "src/core/components/tables/PollingStationTable"
import CommitteeTable from "src/core/components/tables/CommitteeTable"
import useUpload from "src/core/hooks/useUpload"

const { RangePicker } = DatePicker
const { Text } = Typography

const HomePage: BlitzPage = () => {
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [isUpdating, setIsUpdating] = useState(false)

  const [initialData, { refetch: refetchData }] = useQuery(getBasis, null, {
    refetchOnWindowFocus: false,
  })
  const [data, setDisplayData] = useState<Basis | null>()

  const {
    isUploading,
    messageApi,
    contextHolder,
    handleFileChange: _handleFileChange,
    uploadFile,
  } = useUpload()


  const [form] = Form.useForm()
  const updateForm = useCallback(() => {
    form.setFieldsValue({
      electionName: data?.general.name ?? "",
      electionPeriod: data
        ? [dayjs(data?.general.startDate), dayjs(data?.general.endDate)]
        : undefined,
    })
  }, [form, data])

  useEffect(() => {
    updateForm()
  }, [updateForm, data])

  useEffect(() => {
    if (!!data) return
    setDisplayData(initialData)
  }, [data, setDisplayData, initialData])

  const items: TabsProps["items"] = [
    {
      key: "basics",
      label: "Eckdaten",
      children: (
        <>
          <Row>
            <Col span={5}>
              <Form.Item name="electionName" label="Name der Wahlen">
                <Input placeholder="Gremienwahlen" disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={5}>
              <Form.Item name="electionPeriod" label="Wahlzeitraum">
                <RangePicker format="DD.MM.YYYY" style={{ width: "100%" }} disabled></RangePicker>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "sites",
      label: "Standorte",
      children: <SiteTable data={data?.sites ?? []} />,
    },
    {
      key: "pollingStations",
      label: "Wahllokale",
      children: <PollingStationTable data={data?.pollingStations ?? []} />,
    },
    {
      key: "constituencies",
      label: "Wahlkreise",
      children: <ConstituencyTable data={data?.constituencies ?? []} />,
    },
    {
      key: "statusGroups",
      label: "Statusgruppen",
      children: <StatusGroupTable data={data?.statusGroups ?? []} />,
    },
    {
      key: "committees",
      label: "Gremien",
      children: <CommitteeTable data={data?.committees ?? []} />,
    },
    {
      key: "elections",
      label: "Einzelne Wahlen",
      children: <ElectionTable data={data?.elections ?? []} />,
    },
  ]

  const downloadExcel = async () => {
    setIsDownloadingExcel(true)
    const response = await fetch("/api/basis/download")
    await saveBlob(await response.blob(), response.headers.get("content-disposition"))
    setIsDownloadingExcel(false)
  }

  const downloadFailed = async (errorInfo: any) => {
    await messageApi.error(errorInfo.toString())
    setIsDownloadingExcel(false)
  }

  const updateDisplay = useCallback(async () => {
    setIsUpdating(true)
    try {
      setDisplayData((await refetchData()).data)
    } finally {
      setIsUpdating(false)
    }
  }, [refetchData])

  const handleFileChange = async (change: UploadChangeParam<UploadFile>) =>
    _handleFileChange(
      change,
      async () => {
        await updateDisplay()
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

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Basisdaten einer Wahl</Title>
      <Form layout="vertical" onFinish={downloadExcel} onFinishFailed={downloadFailed} form={form}>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={isDownloadingExcel}>
            Basisdaten speichern
          </Button>
          <UploadComponent
            action="/api/import/basis"
            maxCount={1}
            showUploadList={false}
            onChange={handleFileChange}
            customRequest={(options) => uploadFile(options, "basis")}
            accept=".xlsx"
          >
            <Button icon={<UploadOutlined />} loading={isUploading || isUpdating}>
              Importieren
            </Button>
          </UploadComponent>
        </Space>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>
    </>
  )
}

HomePage.getLayout = (page) => <Layout title="Basisdaten">{page}</Layout>

export default HomePage
