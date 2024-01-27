import React, { useCallback, useEffect, useState } from "react"
import { UploadOutlined, PlusOutlined } from "@ant-design/icons"
import {
  Upload as UploadComponent,
  Typography,
  Button,
  Space,
  Tabs,
  Modal,
  Form,
  Input,
  Radio,
  DatePicker,
  Select,
} from "antd"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { TabsProps, UploadFile } from "antd/lib"
import CandidateListTable from "src/core/components/tables/CandidateListTable"
import CandidateTable from "src/core/components/tables/CandidateTable"
import useUpload from "src/core/hooks/useUpload"
import { UploadChangeParam } from "antd/es/upload"
import PersonTable from "src/core/components/tables/PersonTable"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getPersons from "./api/basis/queries/getPersons"
import { Candidate, CandidateList, CandidateListOrderType } from "src/types"
import getElectionsInSet from "./api/basis/queries/getElectionsInSet"
import getLatestElectionSet from "./api/basis/queries/getLatestElectionSet"
import { fullName } from "src/core/lib/person"
import createCandidateList from "./api/basis/mutations/createCandidateList"
import createVersion from "./api/basis/mutations/createVersion"
import createCandidacies from "./api/basis/mutations/createCandidacies"
import getCandidateLists from "./api/basis/queries/getCandidateLists"

const { Title, Text } = Typography

const CandidaturesPage: BlitzPage = () => {
  const {
    isUploading,
    handleFileChange: _handleFileChange,
    uploadFile,
    messageApi,
    contextHolder,
  } = useUpload()

  const [isUpdatingPersons, setIsUpdatingPersons] = useState(false)

  const [initialPersons, { refetch: refetchPersons }] = useQuery(getPersons, null, {
    refetchOnWindowFocus: false,
  })
  const [persons, setPersons] = useState<Candidate[] | null>()

  const updatePersons = useCallback(async () => {
    setIsUpdatingPersons(true)
    try {
      setPersons((await refetchPersons()).data)
    } finally {
      setIsUpdatingPersons(false)
    }
  }, [refetchPersons])

  useEffect(() => {
    if (!!persons) return
    setPersons(initialPersons)
  }, [persons, setPersons, initialPersons])

  const handleFileChange = async (change: UploadChangeParam<UploadFile>) =>
    _handleFileChange(
      change,
      async () => {
        await updatePersons()
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
      key: "persons",
      label: "Personen",
      children: <PersonTable data={persons ?? []} />,
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
          <Button icon={<UploadOutlined />} loading={isUploading || isUpdatingPersons}>
            Personen importieren
          </Button>
        </UploadComponent>
      </Space>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  )
}

CandidaturesPage.getLayout = (page) => <Layout title="Listen">{page}</Layout>

export default CandidaturesPage
