import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Committee } from "src/types"

const CommitteeTable = ({ data }: { data: Committee[] }) => {
  const columns: ColumnsType<Committee> = [
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
  ]

  return (
    <Table columns={columns} dataSource={data} rowKey="id" pagination={false} scroll={{ y: 500 }} />
  )
}

export default CommitteeTable
