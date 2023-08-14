'use client'

import React, { useState } from 'react'
import { FileAddOutlined, FileSyncOutlined } from '@ant-design/icons'
import { ConfigProvider, Upload, Typography, Button, Form, UploadFile, message } from 'antd'
import theme from '@/theme/themeConfig'
import { UploadChangeParam } from 'antd/es/upload'
import { DownloadInfo } from '../api/files/upload/route'

const { Dragger } = Upload
const { Title } = Typography

export interface DonwloadRequestData extends DownloadInfo {
  originalFilename: string,
  type: string
}

const CountPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [file, setFile] = useState<UploadFile>()
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>()
  const [isGeneratingResults, setIsGeneratingResults] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const filesChanged = (change: UploadChangeParam<UploadFile>) => {
    const { status, response } = change.file

    if (status === 'done') {
      messageApi.success(`Uplaod erfolgreich`)
      setDownloadInfo(response)
    } else if (status === 'error') {
      messageApi.error(`Upload fehlgeschlagen`)
    }

    if (status !== 'uploading') {
      setFile(change.fileList[0])
    }

    setTimeout(() => setIsUploading(status === 'uploading'), 50)
  }

  const onFinish = async () => {
    const payload = {
      originalFilename: file?.name,
      type: file?.type,
      ...downloadInfo
    }

    setIsGeneratingResults(true)

    const resultHtml = await (await fetch('../api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })).text()

    setIsGeneratingResults(false)

    const printContainer = document.querySelector("#print-container") as HTMLIFrameElement
    printContainer.onload = () => setTimeout(() => printContainer.contentWindow?.print(), 400)
    printContainer.srcdoc = resultHtml
  }

  const onFinishFailed = (errorInfo: any) => {
    messageApi.error(errorInfo)
  }

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Ergebnis-Protokoll erstellen</Title>
      <Form
        name="count-result"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item>
          <Dragger
            multiple={false}
            action='../api/files/upload'
            maxCount={1}
            onChange={filesChanged}
            accept='.xls,.xlsx'
          >
            <p className="ant-upload-drag-icon">
              {file ? <FileSyncOutlined /> : <FileAddOutlined />}
            </p>
            <p className="ant-upload-text">{file && "Andere "}Ergebnis-Excel-Datei hochladen (.xlsx)</p>
            <p className="ant-upload-hint">
              Klicken oder Datei hierhin ziehen and ablegen
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            size='large'
            htmlType="submit"
            disabled={!file || isUploading}
            loading={isGeneratingResults && { delay: 200 }}
          >
            Ergebnis-Protokoll herunterladen
          </Button>
        </Form.Item>
      </Form>
      <iframe id="print-container" style={{ display: "none" }}></iframe>
    </ConfigProvider>
  )
}

export default CountPage