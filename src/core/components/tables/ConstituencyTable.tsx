import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"

export interface Constituency {
  name: string
  shortName: string
  groups?: string[]
}

const ConstituencyTable = ({ data }: { data: Constituency[] }) => {
  const columns: ColumnsType<Constituency> = [
    {
      title: "Kürzel",
      dataIndex: "shortName",
      width: 200,
      sorter: (a, b) => a.shortName.localeCompare(b.shortName),
      defaultSortOrder: "ascend",
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
  ]

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 500 }} />
}

export default ConstituencyTable
