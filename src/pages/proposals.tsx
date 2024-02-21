import React, { useEffect, useState } from "react"
import { DownloadOutlined } from "@ant-design/icons"
import { Typography, Button, message, Space } from "antd"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { getAntiCSRFToken } from "@blitzjs/auth"
import ElectionDocumentGenerationTable, {
  GenerationListEntry,
} from "src/core/components/tables/ElectionDocumentGenerationTable"
import { useQuery } from "@blitzjs/rpc"
import getElections from "./api/basis/queries/getElections"

const { Title } = Typography

const ProposalPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [elections] = useQuery(getElections, null)

  const [isDownloadingAllProposals, setIsDownloadingAllProposals] = useState(false)
  const [data, setData] = useState<GenerationListEntry[]>([])

  useEffect(() => {
    setData(
      elections.map((election, index): GenerationListEntry => {
        return {
          election,
          disabled: data[index]?.disabled ?? false,
          onDownload: async (event, electionId) => await onDownload(electionId),
        }
      })
    )
  }, [elections])

  useEffect(() => {
    if (data.length !== elections.length) return // prevent overwriting initially queried and set elections on first render (when `disabled` is false anyways)
    setData(
      data.map((entry) => {
        return {
          ...entry,
          disabled: isDownloadingAllProposals,
        }
      })
    )
  }, [isDownloadingAllProposals])

  const downloadAllProposals = async () => {
    setIsDownloadingAllProposals(true)
    await onDownload()
    setIsDownloadingAllProposals(false)
  }

  const onDownload = async (electionId?: number) => {
    try {
      const response = await fetch(
        electionId ? `/api/proposals/${electionId}` : `/api/proposals/download`,
        {
          headers: {
            "anti-csrf": getAntiCSRFToken(),
          },
        }
      )
      if (response.status !== 200) {
        throw new Error(
          `Download fehlgeschlagen. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
            response.status
          } - ${await response.text()}`
        )
      }
      await saveBlob(await response.blob(), response.headers.get("content-disposition"))
    } catch (error) {
      console.error(error)
      void messageApi.error(error.toString(), 10)
    }
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Wahlvorschläge erstellen</Title>
      <Space direction="vertical">
        <Space wrap>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadAllProposals}
            loading={isDownloadingAllProposals}
          >
            Alle Wahlvorschläge herunterladen
          </Button>
        </Space>
        <ElectionDocumentGenerationTable data={data ?? []} />
      </Space>
    </>
  )
}

ProposalPage.getLayout = (page) => <Layout title="Wahlvorschläge">{page}</Layout>

export default ProposalPage
