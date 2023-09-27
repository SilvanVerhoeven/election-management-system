'use client'

import React, { useState } from 'react'
import { Button, Form, Input, Space, Tabs, Upload, DatePicker, Row, Col, Typography, Switch, message } from 'antd'
import type { TabsProps } from 'antd'
import Title from 'antd/es/typography/Title'
import {
  UploadOutlined
} from '@ant-design/icons'
import ConstituencyTable from '@/components/tables/ConstituencyTable'
import StatusGroupTable from '@/components/tables/StatusGroupTable'
import ElectionTable from '@/components/tables/ElectionTable'
import CandidateTable from '@/components/tables/CandidateTable'
import { saveBlob } from '@/lib/files'

const { RangePicker } = DatePicker
const { Text } = Typography

const HomePage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const [data, setData] = useState({
    election: {
      name: "",
      begin: new Date("01-01-2023"),
      end: new Date("02-01-2023")
    },
    constituencies: {},
    elections: [],
    candidates: []
  })

  const items: TabsProps['items'] = [
    {
      key: 'basics',
      label: 'Eckdaten',
      children:
        <>
          <Row>
            <Col span={5}>
              <Form.Item name="electionName" label="Name der Wahlen">
                <Input placeholder='Gremienwahlen' />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={5}>
              <Form.Item name="electionPeriod" label="Wahlzeitraum">
                <RangePicker
                  format="DD.MM.YYYY"
                  style={{ width: '100%' }}
                ></RangePicker>
              </Form.Item>
            </Col>
          </Row>
        </>,
    },
    {
      key: 'constituencies',
      label: 'Wahlkreise',
      children:
        <>
          <ConstituencyTable data={[
            { shortName: 'DE', name: 'Digital Engineering Fakultät' },
            { shortName: 'MatNat', name: 'Mathematisch-Naturwissenschaftliche Fakultät' },
            { shortName: 'Zentral', name: 'Zentralebene' },
            { shortName: 'DE', name: 'Digital Engineering Fakultät' },
            { shortName: 'MatNat', name: 'Mathematisch-Naturwissenschaftliche Fakultät' },
            { shortName: 'Zentral', name: 'Zentralebene' },
            { shortName: 'DE', name: 'Digital Engineering Fakultät' },
            { shortName: 'MatNat', name: 'Mathematisch-Naturwissenschaftliche Fakultät' },
            { shortName: 'Zentral', name: 'Zentralebene' },
            { shortName: 'DE', name: 'Digital Engineering Fakultät' },
            { shortName: 'MatNat', name: 'Mathematisch-Naturwissenschaftliche Fakultät' },
            { shortName: 'Zentral', name: 'Zentralebene' },
          ]} />
        </>,
    },
    {
      key: 'statusGroups',
      label: 'Statusgruppen',
      children:
        <StatusGroupTable data={[
          { shortName: 'M-TV', name: 'Mitarbeitende aus Technik und Verwaltung', priority: 2 },
          { shortName: 'Prof', name: 'Professorium', priority: 1 },
          { shortName: 'Stud', name: 'Studierende', priority: 4 },
          { shortName: 'WissMa', name: 'Wissenschaftliche Mitarbeitende', priority: 3 },
        ]} />,
    },
    {
      key: 'elections',
      label: 'Einzelne Wahlen',
      children:
        <ElectionTable data={[
          { committee: { name: 'Senat' }, numberOfSeats: 1, statusGroups: [{ shortName: 'Prof', name: 'Professorium', priority: 1 }], constituencies: [{ shortName: 'DE', name: 'Digital Engineering Fakultät' }, { shortName: 'MatNat', name: 'Mathematisch-Naturwissenschaftliche Fakultät' }] },
          { committee: { name: 'Senat' }, numberOfSeats: 1, statusGroups: [{ shortName: 'Prof', name: 'Professorium', priority: 1 }], constituencies: [{ shortName: 'HuWi', name: 'Fakultät für Humanwissenschaften' }, { shortName: 'Philo', name: 'Philosophische Fakultät' }] },
          { committee: { name: 'Senat' }, numberOfSeats: 1, statusGroups: [{ shortName: 'Prof', name: 'Professorium', priority: 1 }], constituencies: [{ shortName: 'WiSo', name: 'Fakultät für Wirtschafts- und Sozialwissenschaften' }] },
          { committee: { name: 'Senat' }, numberOfSeats: 1, statusGroups: [{ shortName: 'Stud', name: 'Studierende', priority: 4 }], constituencies: [{ shortName: 'Alle', name: 'Alle Fakultäten' }] },
          { committee: { name: 'Senat' }, numberOfSeats: 1, statusGroups: [{ shortName: 'WissMa', name: 'Wissenschaftliche Mitarbeitende', priority: 3 }], constituencies: [{ shortName: 'Alle', name: 'Alle Fakultäten' }, { shortName: 'Zentral', name: 'Zentralebene' }] },
        ]} />,
    },
    {
      key: 'candidates',
      label: 'Kandidaturen',
      children:
        <CandidateTable data={[
          { firstname: 'Mika', surname: 'Mustermensch', statusGroup: { shortName: 'Stud', name: 'Studierende', priority: 4 }, course: 'IT-Systems Engineering', faculty: 'DE', id: '128523' },
        ]} />,
    },
  ]

  const downloadExcel = async () => {
    setIsDownloadingExcel(true)
    const response = await fetch('../api/basis/download')
    await saveBlob(await response.blob(), response.headers.get('content-disposition'))
    setIsDownloadingExcel(false)
  }

  const downloadFailed = (errorInfo: any) => {
    messageApi.error(errorInfo)
    setIsDownloadingExcel(false)
  }

  return (
    <>
      <Title style={{ marginTop: 0 }}>Basisdaten einer Wahl</Title>
      <Form layout='vertical' onFinish={downloadExcel} onFinishFailed={downloadFailed}>
        <Space wrap>
          <Button type='primary' htmlType='submit' loading={isDownloadingExcel}>Basisdaten speichern</Button>
          <Upload maxCount={1} showUploadList={false}>
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

export default HomePage