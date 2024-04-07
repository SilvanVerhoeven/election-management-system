import React, { useEffect, useState } from "react"
import { DownloadOutlined } from "@ant-design/icons"
import { Typography, Button, message, Space } from "antd"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { getAntiCSRFToken } from "@blitzjs/auth"
import {
  CommitteeGenerationListEntry,
  CommitteeGenerationTable,
} from "src/core/components/tables/ElectionDocumentGenerationTable"
import { useQuery } from "@blitzjs/rpc"
import getProposalsData from "./api/proposals/queries/getProposalsData"

const { Title } = Typography

const ProposalPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [proposalData] = useQuery(getProposalsData, null)

  const [isDownloadingAllProposals, setIsDownloadingAllProposals] = useState(false)
  const [data, setData] = useState<CommitteeGenerationListEntry[]>([])

  useEffect(() => {
    const entries = proposalData.map((data) => {
      return {
        entry: data.committee,
        subEntry: data.constituencies,
        disabled: false,
        onDownload: !data.constituencies
          ? async (event, committeeId) => await onDownload(committeeId)
          : async (event, committeeId) =>
              await onDownload(
                committeeId,
                data.constituencies!.map((c) => c.globalId)
              ),
      }
    })

    setData(entries)
  }, [proposalData])

  useEffect(() => {
    if (data.length !== proposalData.length) return // prevent overwriting initially queried and set proposals on first render (when `disabled` is false anyways)
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

  const onDownload = async (committeeId?: number, constituencyIds?: number[]) => {
    try {
      const response = await fetch(
        committeeId ? `/api/proposals/${committeeId}` : `/api/proposals/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "anti-csrf": getAntiCSRFToken(),
          },
          body: JSON.stringify(constituencyIds ?? []),
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
        <CommitteeGenerationTable data={data ?? []} />
      </Space>
    </>
  )
}

ProposalPage.getLayout = (page) => <Layout title="Wahlvorschläge">{page}</Layout>

export default ProposalPage
