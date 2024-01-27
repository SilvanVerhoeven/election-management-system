import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { CandidateList, Election } from "src/types"
import ElectionDisplay, { getDisplayText } from "../displays/ElectionDisplay"

const CandidateListTable = ({ data }: { data: CandidateList[] }) => {
  const columns: ColumnsType<CandidateList> = [
    {
      title: "Kürzel",
      dataIndex: "shortName",
      width: 200,
      sorter: (a, b) => (a.shortName ?? "").localeCompare(b.shortName ?? ""),
      defaultSortOrder: "ascend",
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Wahl",
      dataIndex: ["candidatesFor"],
      render: (election: Election) => <ElectionDisplay election={election} />,
      sorter: (a, b) =>
        getDisplayText(a.candidatesFor).localeCompare(getDisplayText(b.candidatesFor)),
    },
    {
      title: "Mitglieder",
      dataIndex: ["candidates", "length"],
      sorter: (a, b) => a.candidates.length - b.candidates.length,
    },
    {
      title: "Reihenfolge",
      dataIndex: "order",
      sorter: (a, b) => a.order.localeCompare(b.order),
    },
    {
      title: "Eingereicht am",
      dataIndex: "submittedOn",
      sorter: (a, b) => a.submittedOn.getTime() - b.submittedOn.getTime(),
    },
    {
      title: "Erstellt am",
      dataIndex: "createdOn",
      sorter: (a, b) => a.createdOn.getTime() - b.createdOn.getTime(),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="globalId"
      pagination={false}
      scroll={{ y: 500 }}
    />
  )
}

export default CandidateListTable
