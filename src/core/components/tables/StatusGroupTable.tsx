import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"

export interface StatusGroup {
  name: string
  shortName: string
  priority: number
  groups?: string[]
}

const StatusGroupTable = ({ data }: { data: StatusGroup[] }) => {
  const columns: ColumnsType<StatusGroup> = [
    {
      title: "Priorität",
      dataIndex: "priority",
      width: 120,
      sorter: (a, b) => a.priority - b.priority,
      defaultSortOrder: "ascend",
    },
    {
      title: "Kürzel",
      dataIndex: "shortName",
      width: 200,
      sorter: (a, b) => a.shortName.localeCompare(b.shortName),
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
  ]

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 500 }} />
}

export default StatusGroupTable
