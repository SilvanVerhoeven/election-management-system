import React, { useCallback, useEffect, useState } from "react"
import {
  Button,
  Form,
  Input,
  Space,
  Tabs,
  DatePicker,
  Row,
  Col,
  Typography,
  Modal,
  message,
} from "antd"
import type { TabsProps } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import ConstituencyTable from "src/core/components/tables/ConstituencyTable"
import StatusGroupTable from "src/core/components/tables/StatusGroupTable"
import ElectionTable from "src/core/components/tables/ElectionTable"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { Basis } from "src/types"
import { useQuery } from "@blitzjs/rpc"
import dayjs from "dayjs"
import SiteTable from "src/core/components/tables/SiteTable"
import getBasis from "./api/basis/queries/getBasis"
import PollingStationTable from "src/core/components/tables/PollingStationTable"
import CommitteeTable from "src/core/components/tables/CommitteeTable"
import ImportTable, {
  ImportModalUploadField,
  ImportModalUploadFieldType,
} from "src/core/components/tables/ImportTable"

const { RangePicker } = DatePicker
const { Text, Title } = Typography

const HomePage: BlitzPage = () => {
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [initialData, { refetch: refetchData }] = useQuery(getBasis, null, {
    refetchOnWindowFocus: false,
  })
  const [data, setDisplayData] = useState<Basis | null>()

  const [showImportModal, setShowImportModal] = useState(false)
  const openImportModal = () => setShowImportModal(true)
  const closeImportModal = () => setShowImportModal(false)

  const [messageApi, contextHolder] = message.useMessage()

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

  const updateDisplay = useCallback(
    async () => setDisplayData((await refetchData()).data),
    [refetchData]
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

        <Title level={5}>Basisdaten</Title>

        <ImportTable
          uploadFields={
            [
              {
                key: ImportModalUploadFieldType.BASIS,
                type: ImportModalUploadFieldType.BASIS,
                label: "Basisdaten (.xlsx)",
                action: "/api/import/basis",
                accept: ".xlsx",
              },
            ] as (ImportModalUploadField & { key: ImportModalUploadFieldType })[]
          }
          onFinishedDataImport={updateDisplay}
        />

        <Title level={5}>Daten vom ZIM</Title>

        <ImportTable
          uploadFields={
            [
              {
                key: ImportModalUploadFieldType.FACULTY,
                type: ImportModalUploadFieldType.FACULTY,
                label: "Fakultäten (.csv)",
                action: "/api/import/faculties",
                accept: ".csv",
              },
              {
                key: ImportModalUploadFieldType.DEPARTMENT,
                type: ImportModalUploadFieldType.DEPARTMENT,
                label: "Lehr- und Forschungsbereiche (.xlsx)",
                action: "/api/import/departments",
                accept: ".xlsx",
              },
              {
                key: ImportModalUploadFieldType.ACCOUNTING_UNIT,
                type: ImportModalUploadFieldType.ACCOUNTING_UNIT,
                label: "Kostenstellen (.xlsx)",
                action: "/api/import/accountingUnits",
                accept: ".xlsx",
              },
              {
                key: ImportModalUploadFieldType.SUBJECT,
                type: ImportModalUploadFieldType.SUBJECT,
                label: "Fächer (.xlsx)",
                action: "/api/import/subjects",
                accept: ".xlsx",
              },
              {
                key: ImportModalUploadFieldType.STUDENT,
                type: ImportModalUploadFieldType.STUDENT,
                label: "Studierende (.xlsx)",
                action: "/api/import/students",
                accept: ".xlsx",
              },
              {
                key: ImportModalUploadFieldType.EMPLOYEE,
                type: ImportModalUploadFieldType.EMPLOYEE,
                label: "Mitarbeitende (.csv)",
                action: "/api/import/employees",
                accept: ".csv",
              },
            ] as (ImportModalUploadField & { key: ImportModalUploadFieldType })[]
          }
          onFinishedDataImport={updateDisplay}
        />
      </Modal>
    </>
  )
}

HomePage.getLayout = (page) => <Layout title="Basisdaten">{page}</Layout>

export default HomePage
