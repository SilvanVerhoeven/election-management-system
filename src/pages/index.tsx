import React, { useState } from "react"
import {
  Button,
  Form,
  Input,
  Space,
  Tabs,
  Upload,
  DatePicker,
  Row,
  Col,
  Typography,
  Switch,
  message,
} from "antd"
import type { TabsProps, UploadProps } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import ConstituencyTable from "src/core/components/tables/ConstituencyTable"
import StatusGroupTable from "src/core/components/tables/StatusGroupTable"
import ElectionTable from "src/core/components/tables/ElectionTable"
import CandidateTable from "src/core/components/tables/CandidateTable"
import { saveBlob } from "src/core/lib/files"
import Title from "antd/lib/typography/Title"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"

const { RangePicker } = DatePicker
const { Text } = Typography

const HomePage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [data, setData] = useState({
    election: {
      name: "",
      begin: new Date("01-01-2023"),
      end: new Date("02-01-2023"),
    },
    constituencies: {},
    elections: [],
    candidates: [],
  })

  const items: TabsProps["items"] = [
    {
      key: "basics",
      label: "Eckdaten",
      children: (
        <>
          <Row>
            <Col span={5}>
              <Form.Item name="electionName" label="Name der Wahlen">
                <Input placeholder="Gremienwahlen" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={5}>
              <Form.Item name="electionPeriod" label="Wahlzeitraum">
                <RangePicker format="DD.MM.YYYY" style={{ width: "100%" }}></RangePicker>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "constituencies",
      label: "Wahlkreise",
      children: (
        <>
          <ConstituencyTable
            data={[
              { shortName: "DE", name: "Digital Engineering Fakultät" },
              { shortName: "MatNat", name: "Mathematisch-Naturwissenschaftliche Fakultät" },
              { shortName: "Zentral", name: "Zentralebene" },
              { shortName: "DE", name: "Digital Engineering Fakultät" },
              { shortName: "MatNat", name: "Mathematisch-Naturwissenschaftliche Fakultät" },
              { shortName: "Zentral", name: "Zentralebene" },
              { shortName: "DE", name: "Digital Engineering Fakultät" },
              { shortName: "MatNat", name: "Mathematisch-Naturwissenschaftliche Fakultät" },
              { shortName: "Zentral", name: "Zentralebene" },
              { shortName: "DE", name: "Digital Engineering Fakultät" },
              { shortName: "MatNat", name: "Mathematisch-Naturwissenschaftliche Fakultät" },
              { shortName: "Zentral", name: "Zentralebene" },
            ]}
          />
        </>
      ),
    },
    {
      key: "statusGroups",
      label: "Statusgruppen",
      children: (
        <StatusGroupTable
          data={[
            { shortName: "M-TV", name: "Mitarbeitende aus Technik und Verwaltung", priority: 2 },
            { shortName: "Prof", name: "Professorium", priority: 1 },
            { shortName: "Stud", name: "Studierende", priority: 4 },
            { shortName: "WissMa", name: "Wissenschaftliche Mitarbeitende", priority: 3 },
          ]}
        />
      ),
    },
    {
      key: "elections",
      label: "Einzelne Wahlen",
      children: (
        <ElectionTable
          data={[
            {
              committee: { name: "Senat" },
              numberOfSeats: 1,
              statusGroups: [{ shortName: "Prof", name: "Professorium", priority: 1 }],
              constituencies: [
                { shortName: "DE", name: "Digital Engineering Fakultät" },
                { shortName: "MatNat", name: "Mathematisch-Naturwissenschaftliche Fakultät" },
              ],
            },
            {
              committee: { name: "Senat" },
              numberOfSeats: 1,
              statusGroups: [{ shortName: "Prof", name: "Professorium", priority: 1 }],
              constituencies: [
                { shortName: "HuWi", name: "Fakultät für Humanwissenschaften" },
                { shortName: "Philo", name: "Philosophische Fakultät" },
              ],
            },
            {
              committee: { name: "Senat" },
              numberOfSeats: 1,
              statusGroups: [{ shortName: "Prof", name: "Professorium", priority: 1 }],
              constituencies: [
                { shortName: "WiSo", name: "Fakultät für Wirtschafts- und Sozialwissenschaften" },
              ],
            },
            {
              committee: { name: "Senat" },
              numberOfSeats: 1,
              statusGroups: [{ shortName: "Stud", name: "Studierende", priority: 4 }],
              constituencies: [{ shortName: "Alle", name: "Alle Fakultäten" }],
            },
            {
              committee: { name: "Senat" },
              numberOfSeats: 1,
              statusGroups: [
                { shortName: "WissMa", name: "Wissenschaftliche Mitarbeitende", priority: 3 },
              ],
              constituencies: [
                { shortName: "Alle", name: "Alle Fakultäten" },
                { shortName: "Zentral", name: "Zentralebene" },
              ],
            },
          ]}
        />
      ),
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

  const loadExcel = (file: File) => {}

  const handleFileChange: UploadProps["onChange"] = ({ file }) => {
    if (file.status !== "done" || !file.originFileObj) return
    loadExcel(file.originFileObj)
  }

  return (
    <>
      <Title style={{ marginTop: 0 }}>Basisdaten einer Wahl</Title>
      <Form layout="vertical" onFinish={downloadExcel} onFinishFailed={downloadFailed}>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={isDownloadingExcel}>
            Basisdaten speichern
          </Button>
          <Upload maxCount={1} showUploadList={false} onChange={handleFileChange}>
            <Button icon={<UploadOutlined />}>Öffnen</Button>
          </Upload>
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
