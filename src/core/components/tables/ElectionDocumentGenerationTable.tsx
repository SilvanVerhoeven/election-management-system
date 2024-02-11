import React, { MouseEvent, useState } from "react"
import { Button, Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { Election } from "src/types"
import StatusGroupDisplay, {
  getDisplayText as getStatusGroupDisplayText,
} from "../displays/StatusGroupDisplay"
import ConstituencyDisplay, { getDisplayText } from "../displays/ConstituencyDisplay"

export type GenerationListEntry = {
  election: Election
  disabled: boolean
  onDownload: (event: MouseEvent<HTMLElement>, electionId: number) => void | Promise<void>
}

const GenerationActions = ({ data }: { data: GenerationListEntry }) => {
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <Button
      onClick={async (e) => {
        setIsDownloading(true)
        try {
          await data.onDownload(e, data.election.globalId)
        } catch (error) {
          throw error
        } finally {
          setIsDownloading(false)
        }
      }}
      loading={isDownloading}
      disabled={data.disabled}
    >
      Herunterladen
    </Button>
  )
}

const GenerationTable = ({ data }: { data: GenerationListEntry[] }) => {
  const columns: ColumnsType<GenerationListEntry> = [
    {
      title: "Name",
      dataIndex: ["election", "name"],
      width: 150,
      sorter: (a, b) => (a.election.name ?? "").localeCompare(b.election.name ?? ""),
    },
    {
      title: "Gremium",
      dataIndex: ["election", "committee", "name"],
      width: 150,
      sorter: (a, b) => a.election.committee.name.localeCompare(b.election.committee.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Wahlkreis",
      width: 150,
      render: (data: GenerationListEntry) =>
        data.election.constituencies.map((c) => (
          <Tag key={c.globalId}>
            <ConstituencyDisplay constituency={c} />
          </Tag>
        )),
      sorter: (a, b) =>
        a.election.constituencies
          .map((c) => getDisplayText(c))
          .join(",")
          .localeCompare(b.election.constituencies.map((c) => getDisplayText(c)).join(",")),
    },
    {
      title: "Statusgruppe",
      width: 150,
      render: (data: GenerationListEntry) =>
        data.election.statusGroups.map((sg) => (
          <Tag key={sg.globalId}>
            <StatusGroupDisplay statusGroup={sg} />
          </Tag>
        )),
      sorter: (a, b) =>
        a.election.statusGroups
          .map((sg) => getStatusGroupDisplayText(sg))
          .join(",")
          .localeCompare(
            b.election.statusGroups.map((sg) => getStatusGroupDisplayText(sg)).join(",")
          ),
    },
    {
      render: (data: GenerationListEntry) => <GenerationActions data={data} />,
    },
  ]

  return (
    <Table
      virtual
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey={(entry) => entry.election.globalId}
      scroll={{ x: 1000, y: 600 }}
    />
  )
}

export default GenerationTable
