import React, { useState } from "react"
import { FileAddOutlined, FileSyncOutlined } from "@ant-design/icons"
import { UploadRequestOption } from "rc-upload/lib/interface"
import { Upload as AntdUpload, Typography, Button, Form, UploadFile, message } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { saveBlob } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { Upload } from "src/types"
import { getAntiCSRFToken } from "@blitzjs/auth"

const { Dragger } = AntdUpload
const { Title } = Typography

const CountPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [file, setFile] = useState<UploadFile>()
  const [upload, setUpload] = useState<Upload>()
  const [isGeneratingResults, setIsGeneratingResults] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadFailed, setIsUploadFailed] = useState(false)

  const filesChanged = async (change: UploadChangeParam<UploadFile>) => {
    const { status, response, error } = change.file

    if (status === "done") {
      setUpload(response)
      setIsUploadFailed(false)
      void messageApi.success(`Uplaod erfolgreich`)
    } else if (status === "error") {
      setIsUploadFailed(true)
      console.error(error)
      void messageApi.error(`Upload fehlgeschlagen`)
    }

    if (status !== "uploading") {
      setFile(change.fileList[0])
    }

    setTimeout(() => setIsUploading(status === "uploading"), 50)
  }

  const handleUpload = async (options: UploadRequestOption) => {
    const antiCSRFToken = getAntiCSRFToken()
    const payload = new FormData()
    payload.append("method", "db")
    payload.append("file", options.file)
    try {
      const response = await fetch(options.action, {
        method: "POST",
        headers: {
          "anti-csrf": antiCSRFToken,
        },
        body: payload,
      })
      if (response.status !== 200)
        throw new Error(
          `Datei konnte nicht hochgeladen werden. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
            response.status
          } - ${await response.text()}`
        )
      if (options.onSuccess) options.onSuccess(await response.json())
    } catch (error) {
      if (options.onError) {
        options.onError(error)
      } else {
        console.error(error)
      }
    }
  }

  const onDownload = async () => {
    setIsGeneratingResults(true)
    const response = await fetch(`/api/results/${upload?.id}`, {
      headers: {
        "anti-csrf": getAntiCSRFToken(),
      },
    })
    if (response.status !== 200) {
      setIsGeneratingResults(false)
      throw new Error(
        `Datei konnte nicht heruntergeladen werden. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
          response.status
        } - ${await response.text()}`
      )
    }
    await saveBlob(await response.blob(), response.headers.get("content-disposition"))
    setIsGeneratingResults(false)
  }

  const onDownloadFailed = async (errorInfo: any) => {
    await messageApi.error(errorInfo)
    setIsGeneratingResults(false)
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Ergebnis-Protokoll erstellen</Title>
      <Form name="count-result" onFinish={onDownload} onFinishFailed={onDownloadFailed}>
        <Form.Item>
          <Dragger
            multiple={false}
            action="/api/files/upload"
            maxCount={1}
            onChange={filesChanged}
            customRequest={handleUpload}
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
