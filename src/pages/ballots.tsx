import React, { useEffect, useState } from "react"
import { DownloadOutlined } from "@ant-design/icons"
import { Typography, Button, message, Space } from "antd"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { getAntiCSRFToken } from "@blitzjs/auth"
import BallotGenerationTable, {
  BallotGenerationListEntry,
} from "src/core/components/tables/BallotGenerationTable"
import { useQuery } from "@blitzjs/rpc"
import getElections from "./api/basis/queries/getElections"

const { Title } = Typography

const BallotPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [elections] = useQuery(getElections, null)

  const [isDownloadingAllBallots, setIsDownloadingAllBallots] = useState(false)
  const [data, setData] = useState<BallotGenerationListEntry[]>([])

  useEffect(() => {
    setData(
      elections.map((election, index): BallotGenerationListEntry => {
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
          disabled: isDownloadingAllBallots,
        }
      })
    )
  }, [isDownloadingAllBallots])

  const downloadAllBallots = async () => {
    setIsDownloadingAllBallots(true)
    await onDownload()
    setIsDownloadingAllBallots(false)
  }

  const onDownload = async (electionId?: number) => {
    try {
      const response = await fetch(
        electionId ? `/api/ballots/${electionId}` : `/api/ballots/download`,
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
      void messageApi.error(error, 10)
    }
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Stimmzettel erstellen</Title>
      <Space direction="vertical">
        <Space wrap>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadAllBallots}
            loading={isDownloadingAllBallots}
          >
            Alle Stimmzettel herunterladen
          </Button>
        </Space>
        <BallotGenerationTable data={data ?? []} />
      </Space>
    </>
  )
}

BallotPage.getLayout = (page) => <Layout title="Stimmzettel">{page}</Layout>

export default BallotPage
