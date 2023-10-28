import React, { useState } from "react"
import { FileAddOutlined, FileSyncOutlined } from "@ant-design/icons"
import { Upload, Typography, Button, Form, UploadFile, message } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { DownloadInfo } from "./api/files/upload/route"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"

const { Dragger } = Upload
const { Title } = Typography

export interface DonwloadRequestData extends DownloadInfo {
  originalFilename: string
  type: string
}

const CountPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [file, setFile] = useState<UploadFile>()
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>()
  const [isGeneratingResults, setIsGeneratingResults] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadFailed, setIsUploadFailed] = useState(false)

  const filesChanged = async (change: UploadChangeParam<UploadFile>) => {
    const { status, response } = change.file

    if (status === "done") {
      await messageApi.success(`Uplaod erfolgreich`)
      setDownloadInfo(response)
      setIsUploadFailed(false)
    } else if (status === "error") {
      await messageApi.error(`Upload fehlgeschlagen`)
      setIsUploadFailed(true)
    }

    if (status !== "uploading") {
      setFile(change.fileList[0])
    }

    setTimeout(() => setIsUploading(status === "uploading"), 50)
  }

  const onFinish = async () => {
    const payload = {
      originalFilename: file?.name,
      type: file?.type,
      ...downloadInfo,
    }

    setIsGeneratingResults(true)

    const response = await fetch("../api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    await saveBlob(await response.blob(), response.headers.get("content-disposition"))

    setIsGeneratingResults(false)
  }

  const onFinishFailed = async (errorInfo: any) => {
    await messageApi.error(errorInfo)
    setIsGeneratingResults(false)
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Ergebnis-Protokoll erstellen</Title>
      <Form name="count-result" onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item>
          <Dragger
            multiple={false}
            action="../api/files/upload"
            maxCount={1}
            onChange={filesChanged}
            accept=".xls,.xlsx"
          >
            <p className="ant-upload-drag-icon">
              {file ? <FileSyncOutlined /> : <FileAddOutlined />}
            </p>
            <p className="ant-upload-text">
              {file && "Andere "}Ergebnis-Excel-Datei hochladen (.xlsx)
            </p>
            <p className="ant-upload-hint">Klicken oder Datei hierhin ziehen and ablegen</p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            disabled={!file || isUploading || isUploadFailed}
            loading={isGeneratingResults && { delay: 200 }}
          >
            Ergebnis-Protokoll herunterladen
          </Button>
        </Form.Item>
      </Form>
      <iframe id="print-container" style={{ display: "none" }}></iframe>
    </>
  )
}

CountPage.getLayout = (page) => <Layout title="Ergebnis-Protokoll">{page}</Layout>

export default CountPage
