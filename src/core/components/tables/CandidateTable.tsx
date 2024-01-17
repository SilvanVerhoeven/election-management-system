import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Candidate } from "src/types"
import StatusGroupDisplay from "../displays/StatusGroupDisplay"

const CandidateTable = ({ data }: { data: Candidate[] }) => {
  const columns: ColumnsType<Candidate> = [
    {
      title: "Vorname",
      dataIndex: ["firstName"],
      width: 200,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      defaultSortOrder: "ascend",
    },
    {
      title: "Nachname",
      dataIndex: ["lastName"],
      width: 200,
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Statusgruppe",
      render: (candidate: Candidate) =>
        candidate.statusGroups.map((sg) => <StatusGroupDisplay key={sg.id} statusGroup={sg} />),
    },
    // {
    //   title: "Fakultät",
    //   dataIndex: "faculty",
    //   sorter: (a, b) => a.faculty.localeCompare(b.faculty),
    // },
    // {
    //   title: "Studiengang",
    //   dataIndex: "courseOfStudy",
    //   sorter: (a, b) => a.course.localeCompare(b.course),
    // },
    {
      title: "Matrikelnummer",
      dataIndex: "matriculationNumber",
      sorter: (a, b) => (a.matriculationNumber ?? "").localeCompare(b.matriculationNumber ?? ""),
    },
  ]

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 500 }} />
}

export default CandidateTable
