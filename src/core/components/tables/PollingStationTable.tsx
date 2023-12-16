import React from "react"
import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { PollingStation, Site } from "src/types"
import SiteDisplay, { getDisplayText } from "../displays/SiteDisplay"

const PollingStationTable = ({ data }: { data: PollingStation[] }) => {
  const columns: ColumnsType<PollingStation> = [
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
      title: "Standort",
      dataIndex: "locatedAt",
      render: (site: Site) => <SiteDisplay site={site} />,
      sorter: (a, b) => getDisplayText(a.locatedAt).localeCompare(getDisplayText(b.locatedAt)),
    },
  ]

  return (
    <Table columns={columns} dataSource={data} rowKey="id" pagination={false} scroll={{ y: 500 }} />
  )
}

export default PollingStationTable
