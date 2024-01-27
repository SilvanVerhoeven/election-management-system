import React from "react"
import { Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { Candidate } from "src/types"
import StatusGroupDisplay from "../displays/StatusGroupDisplay"
import SubjectDisplay, { getDisplayText } from "../displays/SubjectDisplay"

const PersonTable = ({ data }: { data: Candidate[] }) => {
  const columns: ColumnsType<Candidate> = [
    {
      title: "Vorname",
      dataIndex: ["firstName"],
      width: 150,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      defaultSortOrder: "ascend",
    },
    {
      title: "Nachname",
      dataIndex: ["lastName"],
      width: 150,
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Statusgruppe",
      render: (person: Candidate) =>
        person.statusGroups.map((sg) => (
          <Tag key={sg.globalId}>
            <StatusGroupDisplay statusGroup={sg} />
          </Tag>
        )),
    },
    {
      title: "Studiengang",
      width: 200,
      render: (person: Candidate) => (
        <SubjectDisplay subject={"subject" in person ? person.subject : undefined} />
      ),
      sorter: (a, b) =>
        getDisplayText("subject" in a ? a.subject : undefined).localeCompare(
          getDisplayText("subject" in b ? b.subject : undefined)
        ),
    },
    {
      title: "Matrikelnummer",
      dataIndex: ["matriculationNumber"],
      sorter: (a, b) => (a.matriculationNumber ?? "").localeCompare(a.matriculationNumber ?? ""),
    },
    {
      title: "E-Mail",
      dataIndex: ["email"],
      sorter: (a, b) => (a.email ?? "").localeCompare(b.email ?? ""),
    },
    {
      title: "Status",
      dataIndex: ["status"],
      sorter: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
    },
    {
      title: "Anmerkungen",
      dataIndex: ["comment"],
      sorter: (a, b) => (a.comment ?? "").localeCompare(b.comment ?? ""),
    },
    {
      title: "Verifiziert am",
      dataIndex: ["electabilityVerifiedOn"],
      sorter: (a, b) =>
        (a.electabilityVerifiedOn?.getTime() ?? 0) - (b.electabilityVerifiedOn?.getTime() ?? 0),
    },
    {
      title: "Wahlhilfe",
      dataIndex: ["isElectionHelper"],
      sorter: (a, b) => (!!a.isElectionHelper ? 1 : 0) - (!!b.isElectionHelper ? 1 : 0),
    },
    // {
    //   title: "Fakultät",
    //   dataIndex: "faculty",
    //   sorter: (a, b) => a.faculty.localeCompare(b.faculty),
    // },
  ]

  return (
    <Table
      virtual
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ x: 1000, y: 600 }}
    />
  )
}

export default PersonTable
