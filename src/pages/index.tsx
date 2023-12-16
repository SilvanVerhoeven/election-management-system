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
  Switch,
  message,
} from "antd"
import type { TabsProps, UploadFile, UploadProps } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import ConstituencyTable from "src/core/components/tables/ConstituencyTable"
import StatusGroupTable from "src/core/components/tables/StatusGroupTable"
import ElectionTable from "src/core/components/tables/ElectionTable"
import CandidateTable from "src/core/components/tables/CandidateTable"
import { saveBlob } from "src/core/lib/files"
import Title from "antd/lib/typography/Title"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { UploadChangeParam } from "antd/es/upload"
import { Upload, UploadType } from "src/types"
import { UploadRequestOption } from "rc-upload/lib/interface"
import { getAntiCSRFToken } from "@blitzjs/auth"
import { useMutation, useQuery } from "@blitzjs/rpc"
import importElection from "./api/basis/mutations/importElection"
import dayjs from "dayjs"
import SiteTable from "src/core/components/tables/SiteTable"
import getElectionsBasis, { ElectionBasis } from "./api/basis/queries/getElectionsBasis"
import PollingStationTable from "src/core/components/tables/PollingStationTable"
import CommitteeTable from "src/core/components/tables/CommitteeTable"

const { RangePicker } = DatePicker
const { Text } = Typography

const HomePage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [upload, setUpload] = useState<Upload>()
  const [importElectionMutation] = useMutation(importElection)
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [initialData, { refetch: refetchData }] = useQuery(getElectionsBasis, null, {
    refetchOnWindowFocus: false,
  })
  const [data, setDisplayData] = useState<ElectionBasis>()

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
    {
      key: "candidates",
      label: "Kandidaturen",
      children: (
        <CandidateTable
          data={[
            {
              firstname: "Mika",
              surname: "Mustermensch",
              statusGroup: { shortName: "Stud", name: "Studierende", priority: 4 },
              course: "IT-Systems Engineering",
              faculty: "DE",
              id: "128523",
            },
          ]}
        />
      ),
    },
  ]

  const downloadExcel = async () => {
    setIsDownloadingExcel(true)
    const response = await fetch("/api/basis/download")
    await saveBlob(await response.blob(), response.headers.get("content-disposition"))
    setIsDownloadingExcel(false)
  }

  const downloadFailed = async (errorInfo: any) => {
    await messageApi.error(errorInfo)
    setIsDownloadingExcel(false)
  }

  const loadExcel = useCallback(
    async (upload: Upload) => {
      setIsUpdating(true)
      try {
        await importElectionMutation(upload.id)
      } finally {
        setDisplayData((await refetchData()).data)
        setIsUpdating(false)
      }
    },
    [importElectionMutation, refetchData]
  )

  const handleFileChange: UploadProps["onChange"] = (change: UploadChangeParam<UploadFile>) => {
    const { status, response, error } = change.file

    if (status === "done") {
      setUpload(response)
      void messageApi.success(`Uplaod erfolgreich`)
    } else if (status === "error") {
      console.error(error)
      void messageApi.error(`Upload fehlgeschlagen`)
    }
  }

  const uploadFile = async (options: UploadRequestOption<JSON>) => {
    setIsUploading(true)
    const payload = new FormData()
    const antiCSRFToken = getAntiCSRFToken()
    payload.append("type", UploadType.DATA)
    payload.append("key", "basis")
    payload.append("file", options.file)
    try {
      const response = await fetch(options.action, {
        method: "POST",
        headers: {
          "anti-csrf": antiCSRFToken,
        },
        body: payload,
      })
      if (response.status !== 200)
        throw new Error(
          `Basisdatei konnte nicht hochgeladen werden. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
            response.status
          } - ${await response.text()}`
        )
      if (options.onSuccess) options.onSuccess(await response.json())
    } catch (error) {
      if (options.onError) {
        options.onError(error)
      } else {
        console.error(error)
      }
    }
    setIsUploading(false)
  }

  useEffect(() => {
    if (!upload) return
    void loadExcel(upload)
  }, [upload, loadExcel])

  return (
    <>
      <Title style={{ marginTop: 0 }}>Basisdaten einer Wahl</Title>
      <Form layout="vertical" onFinish={downloadExcel} onFinishFailed={downloadFailed} form={form}>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={isDownloadingExcel}>
            Basisdaten speichern
          </Button>
          <UploadComponent
            action="/api/files/upload"
            maxCount={1}
            showUploadList={false}
            onChange={handleFileChange}
            customRequest={uploadFile}
            accept=".xlsx"
          >
            <Button icon={<UploadOutlined />} loading={isUploading || isUpdating}>
              Öffnen
            </Button>
          </UploadComponent>
          <Space>
            <Text disabled>Automatisch speichern</Text>
            <Switch disabled />
          </Space>
        </Space>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>
    </>
  )
}

HomePage.getLayout = (page) => <Layout title="Basisdaten">{page}</Layout>

export default HomePage
