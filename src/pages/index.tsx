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
  Modal,
  Table,
} from "antd"
import type { TabsProps, UploadFile } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import ConstituencyTable from "src/core/components/tables/ConstituencyTable"
import StatusGroupTable from "src/core/components/tables/StatusGroupTable"
import ElectionTable from "src/core/components/tables/ElectionTable"
import { saveBlob } from "src/core/lib/files"
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
import { ImportResult } from "src/core/lib/import"
import Link from "antd/lib/typography/Link"

const { RangePicker } = DatePicker
const { Text, Title } = Typography

type ImportModalUploadField = {
  type: ImportModalUploadFieldType
  label: string
  action: string
  accept: string
}

enum ImportModalUploadFieldType {
  FACULTY,
  SUBJECT,
}

type ImportResults = Partial<Record<ImportModalUploadFieldType, ImportResult>>

const HomePage: BlitzPage = () => {
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [isUpdating, setIsUpdating] = useState(false)

  const [initialData, { refetch: refetchData }] = useQuery(getBasis, null, {
    refetchOnWindowFocus: false,
  })
  const [data, setDisplayData] = useState<Basis | null>()

  const [importResults, setImportResults] = useState<ImportResults>({})

  const [showImportModal, setShowImportModal] = useState(false)
  const openImportModal = () => setShowImportModal(true)
  const closeImportModal = () => setShowImportModal(false)

  const [showDetailsModal, setShowDetailsModal] = useState<
    Partial<Record<ImportModalUploadFieldType, boolean>>
  >({})
  const openDetailsModal = (type: ImportModalUploadFieldType) =>
    setShowDetailsModal({ ...showDetailsModal, [type]: true })
  const closeDetailsModal = (type: ImportModalUploadFieldType) =>
    setShowDetailsModal({ ...showDetailsModal, [type]: undefined })

  const ResultDetailsModal = ({
    type,
    result,
  }: {
    type: ImportModalUploadFieldType
    result: ImportResult
  }) => {
    return (
      <Modal
        title="Detaillierte Import-Ergebnisse"
        width={800}
        open={showDetailsModal[type]}
        onCancel={() => closeDetailsModal(type)}
        footer={[
          <Button key="back" type="primary" onClick={() => closeDetailsModal(type)}>
            Schließen
          </Button>,
        ]}
      >
        <Table
          size="small"
          pagination={false}
          dataSource={[...result.error, ...result.skipped]}
          columns={[
            { title: "Datensatz", key: "label", dataIndex: "label" },
            { title: "Fehlermeldung", key: "error", dataIndex: "error" },
          ]}
        ></Table>
      </Modal>
    )
  }

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

  const handleFileChange = async (
    field: ImportModalUploadFieldType,
    change: UploadChangeParam<UploadFile>
  ) =>
    _handleFileChange(
      change,
      async (_, response: ImportResult) => {
        setImportResults({ ...importResults, [field]: response })
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
          <Button icon={<UploadOutlined />} onClick={openImportModal}>
            Importieren
          </Button>
        </Space>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>

      <Modal
        open={showImportModal}
        title="Daten importieren"
        onCancel={closeImportModal}
        footer={[
          <Button key="back" type="primary" onClick={closeImportModal}>
            Fertig
          </Button>,
        ]}
      >
        <Text>
          Der erstmalige Import von Daten sollten in der untenstehenden Reihenfolge erfolgen.
        </Text>

        <Title level={5}>Daten vom ZIM</Title>

        <Table
          size="small"
          pagination={false}
          dataSource={
            [
              {
                type: ImportModalUploadFieldType.FACULTY,
                label: "Fachbereiche/Fakultäten (.csv)",
                action: "/api/import/units",
                accept: ".csv",
              },
              {
                type: ImportModalUploadFieldType.SUBJECT,
                label: "Fächer (.xlsx)",
                action: "/api/import/subjects",
                accept: ".xlsx",
              },
            ] as ImportModalUploadField[]
          }
          columns={[
            { title: "Typ", key: "type", dataIndex: "label" },
            {
              key: "action",
              render: (_, record) => (
                <UploadComponent
                  action={record.action}
                  maxCount={1}
                  showUploadList={false}
                  onChange={(change) => handleFileChange(record.type, change)}
                  customRequest={(options) => uploadFile(options, "basis")}
                  accept={record.accept}
                >
                  <Button icon={<UploadOutlined />} loading={isUploading || isUpdating}>
                    Importieren
                  </Button>
                </UploadComponent>
              ),
            },
            {
              title: "Ergebnis",
              key: "result",
              dataIndex: "result",
              render: (_, record) => {
                const result = importResults[record.type]
                if (!result) return <></>
                if (result.skipped.length > 0 || result.error.length > 0) {
                  return (
                    <>
                      {result.error.length > 0 && (
                        <Text type="danger" style={{ display: "block" }}>
                          {result.error.length} fehlgeschlagen
                        </Text>
                      )}
                      {result.skipped.length > 0 && (
                        <Text type="warning" style={{ display: "block" }}>
                          {result.skipped.length} übersprungen
                        </Text>
                      )}
                      <Text style={{ display: "block" }}>{result.success} importiert</Text>
                      <ResultDetailsModal type={record.type} result={result} />
                      <Link onClick={() => openDetailsModal(record.type)}>Details</Link>
                    </>
                  )
                }
                return (
                  <Text type="success">
                    Alle {importResults[record.type]!.success} Datensätze importiert
                  </Text>
                )
              },
            },
          ]}
        ></Table>
      </Modal>
    </>
  )
}

HomePage.getLayout = (page) => <Layout title="Basisdaten">{page}</Layout>

export default HomePage
