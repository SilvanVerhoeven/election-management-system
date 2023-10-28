import React from "react"
import { Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { Constituency } from "./ConstituencyTable"
import { StatusGroup } from "./StatusGroupTable"

export interface Committee {
  name: string
}

export interface Election {
  committee: Committee
  statusGroups: StatusGroup[]
  constituencies: Constituency[]
  numberOfSeats: number
}

const ElectionTable = ({ data }: { data: Election[] }) => {
  const columns: ColumnsType<Election> = [
    {
      title: "Gremium",
      dataIndex: ["committee", "name"],
      width: 200,
      sorter: (a, b) => a.committee.name.localeCompare(b.committee.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Statusgruppen",
      dataIndex: ["statusGroups", "shortName"],
      render: (_, { statusGroups }) => (
        <>
          {statusGroups.map((statusGroup) => (
            <Tag key={statusGroup.shortName}>{statusGroup.shortName}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Wahlkreise",
      dataIndex: ["constituencies", "shortName"],
      render: (_, { constituencies }) => (
        <>
          {constituencies.map((constituency) => (
            <Tag key={constituency.shortName}>{constituency.shortName}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Sitzanzahl",
      dataIndex: "numberOfSeats",
      sorter: (a, b) => a.numberOfSeats - b.numberOfSeats,
    },
  ]

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 500 }} />
}

export default ElectionTable
