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
  InputNumber,
  Flex,
  Popconfirm,
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
import { Person, CandidateList, CandidateListOrderType, Election } from "src/types"
import getElectionsInSet from "./api/basis/queries/getElectionsInSet"
import getLatestElectionSet from "./api/basis/queries/getLatestElectionSet"
import { activeStatusGroup, fullName } from "src/core/lib/person"
import createCandidateList from "./api/basis/mutations/createCandidateList"
import createVersion from "./api/basis/mutations/createVersion"
import createCandidacies from "./api/basis/mutations/createCandidacies"
import getCandidateLists from "./api/basis/queries/getCandidateLists"
import { getDisplayText } from "src/core/components/displays/ElectionDisplay"
import dayjs from "dayjs"
import deleteCandidateList from "./api/basis/mutations/deleteCandidateList"

const { Title, Text } = Typography

interface ListFormProps {
  listName: string
  listShortName?: string
  order: CandidateListOrderType
  submittedOn: Date
  candidatesForId: { label: string; value: number }
  rank?: number
  candidateIds: { label: string; value: number }[]

  // hidden
  globalId?: number
}

const getPersonLabel = (person: Person) => {
  const statusGroupName = activeStatusGroup(person)?.shortName
  return (
    `${fullName(person)}` +
    (!!person.enrolment ? `, ${person.enrolment.matriculationNumber}` : "") +
    (statusGroupName ? ` (${statusGroupName})` : "")
  )
}

const getElectionLabel = (election: Election) => {
  return `#${election.globalId}: ${getDisplayText(election)} (${election.numberOfSeats} ${
    election.numberOfSeats == 1 ? "Sitz" : "Sitze"
  })`
}

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
  const [persons, setPersons] = useState<Person[] | null>()

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

  const [initialLists, { refetch: refetchLists }] = useQuery(getCandidateLists, null, {
    refetchOnWindowFocus: false,
  })
  const [lists, setLists] = useState<CandidateList[] | null>()

  const updateLists = useCallback(async () => {
    setLists((await refetchLists()).data)
  }, [refetchLists])

  const deleteList = async (list: CandidateList) => {
    await deleteCandidateListMutation({ globalId: list.globalId })
    await updateLists()
  }

  useEffect(() => {
    if (!!lists) return
    setLists(initialLists)
  }, [lists, setLists, initialLists])

  const items: TabsProps["items"] = [
    {
      key: "lists",
      label: "Listen",
      children: (
        <CandidateListTable
          data={lists ?? []}
          actionRender={(list) => (
            <Flex gap="small" wrap="wrap">
              <Button
                size="small"
                onClick={() => {
                  form.setFieldsValue({
                    candidateIds: list.candidates.map((candidate) => {
                      return { label: getPersonLabel(candidate), value: candidate.globalId }
                    }),
                    candidatesForId: {
                      label: getElectionLabel(list.candidatesFor),
                      value: list.candidatesForId,
                    },
                    listName: list.name,
                    listShortName: list.shortName ?? undefined,
                    order: list.order,
                    rank: list.rank ?? undefined,
                    submittedOn: dayjs(list.submittedOn),
                    globalId: list.globalId,
                  })
                  openListModal(true)
                }}
              >
                Bearbeiten
              </Button>
              <Popconfirm
                title="Liste löschen?"
                description="Rückgängig machen ist unmöglich."
                onConfirm={async () => await deleteList(list)}
                okText="Endgültig löschen"
                cancelText="Abbrechen"
              >
                <Button size="small" danger type="text">
                  Löschen
                </Button>
              </Popconfirm>
            </Flex>
          )}
        />
      ),
    },
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

  const [form] = Form.useForm<ListFormProps>()

  const [createVersionMutation] = useMutation(createVersion)
  const [createCandidateListMutation] = useMutation(createCandidateList)
  const [createCandidaciesMutation] = useMutation(createCandidacies)
  const [deleteCandidateListMutation] = useMutation(deleteCandidateList)

  const upsertList = async (values: ListFormProps) => {
    try {
      setIsUpsertingList(true)
      const versionId = (await createVersionMutation({})).id
      const list = await createCandidateListMutation({
        name: values.listName,
        shortName: values.listShortName,
        order: values.order,
        submittedOn: values.submittedOn,
        candidatesForId: values.candidatesForId.value,
        rank: values.rank,
        globalId: values.globalId,
        versionId,
      })
      await createCandidaciesMutation({
        listId: list.globalId,
        candidateIds: values.candidateIds.map((ci) => ci.value),
        order:
          list.order == CandidateListOrderType.ALPHABETICALLY
            ? CandidateListOrderType.ALPHABETICALLY
            : CandidateListOrderType.NUMERIC,
      })
      closeListModal()
      form.resetFields()
      void messageApi.success("Liste gespeichert")
    } catch (error) {
      console.error(error)
      void messageApi.error(
        <>
          <Text strong>Speicherung fehlgeschlagen</Text>
          <br />
          <Text>{`${error}`}</Text>
        </>,
        10
      )
    } finally {
      setIsUpsertingList(false)
    }
    await updateLists()
  }

  const [showListModal, setShowListModal] = useState(false)
  const [isInEditMode, setIsInEditMode] = useState(false)
  const [isUpsertingList, setIsUpsertingList] = useState(false)

  const openListModal = (inEditMode: boolean = false) => {
    setIsInEditMode(inEditMode)
    setShowListModal(true)
  }
  const closeListModal = () => {
    setShowListModal(false)
  }

  const [latestElectionSet] = useQuery(getLatestElectionSet, null)
  const [elections, { refetch: refetchElections }] = useQuery(
    getElectionsInSet,
    latestElectionSet?.globalId ?? 0
  )

  const filterElection = (input: string, option?: { label: string; value: number }) => {
    if (!option) return false
    const lowerCaseInput = input.toLowerCase()
    const election = elections.filter((election) => election.globalId == option.value)[0]
    if (!election) return false
    return (
      election.globalId.toString().includes(lowerCaseInput) ||
      (!!election.name && election.name.toLowerCase().includes(lowerCaseInput)) ||
      election.committee.name.toLowerCase().includes(lowerCaseInput) ||
      election.committee.shortName?.toLowerCase().includes(lowerCaseInput) ||
      election.committee.globalId.toString().includes(lowerCaseInput) ||
      election.constituencies.some(
        (c) =>
          c.name.toLowerCase().includes(lowerCaseInput) ||
          c.shortName?.toLowerCase().includes(lowerCaseInput)
      ) ||
      election.statusGroups.some(
        (sg) =>
          sg.name.toLowerCase().includes(lowerCaseInput) ||
          sg.shortName?.toLowerCase().includes(lowerCaseInput)
      )
    )
  }

  useEffect(() => {
    if (!latestElectionSet) return
    void refetchElections()
  }, [latestElectionSet, refetchElections])

  const filterCandidate = (input: string, option?: { label: string; value: number }) => {
    if (!option) return false
    const lowerCaseInput = input.toLowerCase()
    const person = (persons ?? []).filter((person) => person.globalId == option.value)[0]
    if (!person) return false
    return (
      fullName(person).toLowerCase().includes(lowerCaseInput) ||
      !!person.enrolment?.matriculationNumber?.toLowerCase().includes(lowerCaseInput)
    )
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Kandidaturen</Title>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openListModal()}>
          Neue Liste
        </Button>
        <UploadComponent
          disabled
          action="/api/import/students"
          maxCount={1}
          showUploadList={false}
          onChange={handleFileChange}
          customRequest={(options) => uploadFile(options, "persons")}
          accept=".csv"
        >
          <Button disabled icon={<UploadOutlined />} loading={isUploading || isUpdatingPersons}>
            Personen importieren
          </Button>
        </UploadComponent>
      </Space>
      <Tabs defaultActiveKey="1" items={items} />
      <Modal
        title={isInEditMode ? "Liste bearbeiten" : "Neue Liste anlegen"}
        open={showListModal}
        onCancel={closeListModal}
        footer={[
          <Button key="cancel" onClick={closeListModal}>
            Abbrechen
          </Button>,
          <Button
            form="upsertList"
            key="submit"
            htmlType="submit"
            type="primary"
            loading={isUpsertingList}
          >
            {isInEditMode ? "Liste aktualisieren" : "Liste anlegen"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          name="upsertList"
          onFinish={upsertList}
          initialValues={{ ["submittedOn"]: dayjs(new Date()) }}
        >
          <Form.Item name="listName" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="listShortName" label="Kürzel">
            <Input />
          </Form.Item>
          <Form.Item name="order" label="Reihenfolge" rules={[{ required: true }]}>
            <Radio.Group name="order" buttonStyle="solid">
              <Radio.Button value={CandidateListOrderType.NUMERIC}>Numerisch</Radio.Button>
              <Radio.Button value={CandidateListOrderType.ALPHABETICALLY}>
                Alphabetisch
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="submittedOn" label="Eingereicht am" rules={[{ required: true }]}>
            <DatePicker format={"DD.MM.YYYY"} />
          </Form.Item>
          <Form.Item name="candidatesForId" label="Kandidiert für" rules={[{ required: true }]}>
            <Select
              showSearch
              labelInValue
              placeholder="Name der Wahl, Gremium, Status-Gruppe oder Wahlkreis eingeben"
              filterOption={filterElection}
              options={elections.map((election) => {
                return {
                  value: election.globalId,
                  label: getElectionLabel(election),
                }
              })}
            />
          </Form.Item>
          <Form.Item name="candidateIds" label="Kandidierende" rules={[{ required: true }]}>
            <Select
              showSearch
              labelInValue
              mode="multiple"
              placeholder="Namen oder Matrikelnummer eingeben"
              filterOption={filterCandidate}
              options={(persons ?? []).map((person) => {
                return {
                  value: person.globalId,
                  label: getPersonLabel(person),
                }
              })}
            />
          </Form.Item>
          <Form.Item
            name="rank"
            label="Rang"
            extra="Anzeige von Listen nach aufsteigendem Rang. Niedrigster Rang: 1"
          >
            <InputNumber />
          </Form.Item>
          <Form.Item name="globalId" hidden>
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

CandidaturesPage.getLayout = (page) => <Layout title="Listen">{page}</Layout>

export default CandidaturesPage
