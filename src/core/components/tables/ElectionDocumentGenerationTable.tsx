import React, { MouseEvent, useState } from "react"
import { Button, Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { Committee, Constituency, Election } from "src/types"
import StatusGroupDisplay, {
  getDisplayText as getStatusGroupDisplayText,
} from "../displays/StatusGroupDisplay"
import ConstituencyDisplay, { getDisplayText } from "../displays/ConstituencyDisplay"

export type GenerationListEntry<T, K> = {
  entry: T
  subEntry?: K[]
  disabled: boolean
  onDownload: (event: MouseEvent<HTMLElement>, globalId: number) => void | Promise<void>
}

const GenerationActions = <T extends { globalId: number }, K extends { globalId: number } | null>({
  data,
}: {
  data: GenerationListEntry<T, K>
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <Button
      onClick={async (e) => {
        setIsDownloading(true)
        try {
          await data.onDownload(e, data.entry.globalId)
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

export type ElectionGenerationListEntry = GenerationListEntry<Election, null>

export const ElectionGenerationTable = ({ data }: { data: ElectionGenerationListEntry[] }) => {
  const columns: ColumnsType<ElectionGenerationListEntry> = [
    {
      title: "Name",
      dataIndex: ["entry", "name"],
      width: 150,
      sorter: (a, b) => (a.entry.name ?? "").localeCompare(b.entry.name ?? ""),
    },
    {
      title: "Gremium",
      dataIndex: ["entry", "committee", "name"],
      width: 150,
      sorter: (a, b) => a.entry.committee.name.localeCompare(b.entry.committee.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Wahlkreis",
      width: 150,
      render: (data: ElectionGenerationListEntry) =>
        data.entry.constituencies.map((c) => (
          <Tag key={c.globalId}>
            <ConstituencyDisplay constituency={c} />
          </Tag>
        )),
      sorter: (a, b) =>
        a.entry.constituencies
          .map((c) => getDisplayText(c))
          .join(",")
          .localeCompare(b.entry.constituencies.map((c) => getDisplayText(c)).join(",")),
    },
    {
      title: "Statusgruppe",
      width: 150,
      render: (data: ElectionGenerationListEntry) =>
        data.entry.statusGroups.map((sg) => (
          <Tag key={sg.globalId}>
            <StatusGroupDisplay statusGroup={sg} />
          </Tag>
        )),
      sorter: (a, b) =>
        a.entry.statusGroups
          .map((sg) => getStatusGroupDisplayText(sg))
          .join(",")
          .localeCompare(b.entry.statusGroups.map((sg) => getStatusGroupDisplayText(sg)).join(",")),
    },
    {
      render: (data: ElectionGenerationListEntry) => <GenerationActions data={data} />,
    },
  ]

  return (
    <Table
      virtual
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey={(entry) => entry.entry.globalId}
      scroll={{ x: 1000, y: 600 }}
    />
  )
}

export type CommitteeGenerationListEntry = GenerationListEntry<Committee, Constituency>

export const CommitteeGenerationTable = ({ data }: { data: CommitteeGenerationListEntry[] }) => {
  const columns: ColumnsType<CommitteeGenerationListEntry> = [
    {
      title: "Gremium",
      render: (data: CommitteeGenerationListEntry) =>
        data.subEntry
          ? `${data.entry.name} – ${data.subEntry
              .map((constituency) => constituency.shortName)
              .join(", ")}`
          : data.entry.name,
      width: 500,
      sorter: (a, b) => a.entry.name.localeCompare(b.entry.name),
      defaultSortOrder: "ascend",
    },
    {
      render: (data: CommitteeGenerationListEntry) => <GenerationActions data={data} />,
    },
  ]

  return (
    <Table
      virtual
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey={(item) =>
        `${item.entry.globalId}-${(item.subEntry ?? [])
          .map((constituency) => constituency.globalId)
          .join(",")}`
      }
      scroll={{ x: 1000, y: 600 }}
    />
  )
}
