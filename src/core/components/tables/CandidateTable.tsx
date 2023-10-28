import React from "react"
import { Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { StatusGroup } from "./StatusGroupTable"

export interface Candidate {
  firstname: string
  surname: string
  id: string
  statusGroup: StatusGroup
  faculty: string
  course: string
}

const CandidateTable = ({ data }: { data: Candidate[] }) => {
  const columns: ColumnsType<Candidate> = [
    {
      title: "Vorname",
      dataIndex: ["firstname"],
      width: 200,
      sorter: (a, b) => a.firstname.localeCompare(b.firstname),
      defaultSortOrder: "ascend",
    },
    {
      title: "Nachname",
      dataIndex: ["surname"],
      width: 200,
      sorter: (a, b) => a.surname.localeCompare(b.surname),
    },
    {
      title: "Statusgruppe",
      dataIndex: ["statusGroup", "shortName"],
      render: (_, { statusGroup }) => (
        <Tag key={statusGroup.shortName}>{statusGroup.shortName}</Tag>
      ),
    },
    {
      title: "Fakultät",
      dataIndex: "faculty",
      sorter: (a, b) => a.faculty.localeCompare(b.faculty),
    },
    {
      title: "Studiengang",
      dataIndex: "courseOfStudy",
      sorter: (a, b) => a.course.localeCompare(b.course),
    },
    {
      title: "Matrikel/Personalnummer",
      dataIndex: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
  ]

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 500 }} />
}

export default CandidateTable
