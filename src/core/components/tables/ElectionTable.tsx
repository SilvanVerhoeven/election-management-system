import React from "react"
import { Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { Committee, Constituency, Election, StatusGroup } from "src/types"
import CommitteeDisplay, { getDisplayText } from "../displays/CommitteeDisplay"
import StatusGroupDisplay from "../displays/StatusGroupDisplay"
import ConstituencyDisplay from "../displays/ConstituencyDisplay"

const ElectionTable = ({ data }: { data: Election[] }) => {
  const columns: ColumnsType<Election> = [
    {
      title: "Gremium",
      dataIndex: ["committee"],
      width: 200,
      render: (committee: Committee) => <CommitteeDisplay committee={committee} />,
      sorter: (a, b) => getDisplayText(a.committee).localeCompare(getDisplayText(b.committee)),
      defaultSortOrder: "ascend",
    },
    {
      title: "Statusgruppen",
      dataIndex: ["statusGroups"],
      render: (statusGroups: StatusGroup[]) => (
        <>
          {statusGroups.map((statusGroup) => (
            <Tag key={statusGroup.id}>
              <StatusGroupDisplay statusGroup={statusGroup} style={{ fontSize: "inherit" }} />
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Wahlkreise",
      dataIndex: ["constituencies"],
      render: (constituencies: Constituency[]) => (
        <>
          {constituencies.map((constituency) => (
            <Tag key={constituency.id}>
              <ConstituencyDisplay constituency={constituency} style={{ fontSize: "inherit" }} />
            </Tag>
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
