import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Site } from "src/types"

const SiteTable = ({ data }: { data: Site[] }) => {
  const columns: ColumnsType<Site> = [
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
      title: "Beschreibung",
      dataIndex: "description",
      sorter: (a, b) => (a.description ?? "").localeCompare(b.name ?? ""),
    },
  ]

  return (
    <Table columns={columns} dataSource={data} rowKey="id" pagination={false} scroll={{ y: 500 }} />
  )
}

export default SiteTable
