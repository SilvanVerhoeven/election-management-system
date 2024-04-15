import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { CandidateList, Election } from "src/types"
import ElectionDisplay, { getDisplayText } from "../displays/ElectionDisplay"
import { getCandidateListOrderDisplayText } from "src/core/lib/basis"

export const distinctElections = (value: Election, index: number, self: Election[]): boolean => {
  return self.map((e) => e.globalId).indexOf(value.globalId) === index
}

export const byDisplayText = (a: Election, b: Election) =>
  getDisplayText(a).localeCompare(getDisplayText(b))

const CandidateListTable = ({
  data,
  actionRender,
}: {
  data: CandidateList[]
  actionRender: (list: CandidateList) => React.JSX.Element
}) => {
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
      filters: data
        .map((list) => list.candidatesFor)
        .filter(distinctElections)
        .sort(byDisplayText)
        .map((election) => {
          return { text: getDisplayText(election), value: election.globalId }
        }),
      onFilter: (value, record) => record.candidatesFor.globalId === value,
      sorter: (a, b) =>
        getDisplayText(a.candidatesFor).localeCompare(getDisplayText(b.candidatesFor)),
    },
    {
      title: "Rang",
      dataIndex: ["rank"],
      width: 90,
      sorter: (a, b) => a.rank ?? -1 - (b.rank ?? -1),
    },
    {
      title: "Mitglieder",
      dataIndex: ["candidates", "length"],
      width: 120,
      sorter: (a, b) => a.candidates.length - b.candidates.length,
    },
    {
      title: "Reihenfolge",
      dataIndex: "order",
      render: (order) => getCandidateListOrderDisplayText(order),
      sorter: (a, b) => a.order.localeCompare(b.order),
    },
    {
      title: "Eingereicht am",
      dataIndex: "submittedOn",
      render: (date: Date) => date.toLocaleDateString(),
      sorter: (a, b) => a.submittedOn.getTime() - b.submittedOn.getTime(),
    },
    {
      title: "Erstellt am",
      dataIndex: "createdOn",
      render: (date: Date) => date.toLocaleDateString(),
      sorter: (a, b) => a.createdOn.getTime() - b.createdOn.getTime(),
    },
    {
      title: "Aktionen",
      render: actionRender,
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
