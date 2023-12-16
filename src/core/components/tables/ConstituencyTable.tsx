import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Constituency, PollingStation } from "src/types"
import PollingStationDisplay, { getDisplayText } from "../displays/PollingStationDisplay"

const ConstituencyTable = ({ data }: { data: Constituency[] }) => {
  const columns: ColumnsType<Constituency> = [
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
      title: "Präsenzwahl",
      dataIndex: "presenceVotingAt",
      render: (pollingStation: PollingStation) => (
        <PollingStationDisplay pollingStation={pollingStation} />
      ),
      sorter: (a, b) =>
        getDisplayText(a.presenceVotingAt).localeCompare(getDisplayText(b.presenceVotingAt)),
    },
  ]

  return (
    <Table columns={columns} dataSource={data} rowKey="id" pagination={false} scroll={{ y: 500 }} />
  )
}

export default ConstituencyTable
