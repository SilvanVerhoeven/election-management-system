'use client'

import React, { useEffect, useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Upload, Typography, Button, Form, UploadFile, message } from 'antd'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import { DownloadInfo } from '../../api/files/upload/route'
import { templateTypes, TemplateTypes } from '@/lib/types'
import { UploadChangeParam } from 'antd/es/upload'
import { downloadUrl } from '@/lib/files'

const { Title } = Typography

export interface DonwloadRequestData extends DownloadInfo {
  originalFilename: string,
  type: string
}

const TemplateConfigPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [uploadedTemplates, setUploadedTemplates] = useState<{ [key in TemplateTypes]: { filename: string } }>()
  const [isDownloadingTemplates, setIsDownloadingTemplates] = useState(false)

  useEffect(() => {
    const fetchData = async () => setUploadedTemplates(await (await fetch("../../api/templates")).json())
    fetchData()
  }, [])

  const filesChanged = (templateId: TemplateTypes, change: UploadChangeParam<UploadFile>) => {
    const { status } = change.file

    if (status === 'done') {
      messageApi.success(`Uplaod erfolgreich`)
      change.file.url = downloadUrl(templateId)
    } else if (status === 'error') {
      messageApi.error(`Upload fehlgeschlagen`)
    }
  }

  const labels = {
    [templateTypes.Results]: "Wahlergebnis-Protokoll",
    [templateTypes.Config]: "Konfiguration"
  }

  const uploadFile = (templateId: TemplateTypes, options: UploadRequestOption<JSON>) => {
    const data = new FormData()
    data.append('file', options.file)
    data.append('templateId', templateId)
    fetch(options.action, {
      method: 'POST',
      body: data
    }).then(
      async (res) => options.onSuccess && options.onSuccess(await res.json())
    ).catch((err: Error) => {
      console.error(err)
    })
  }

  const deleteFile = async (templateId: TemplateTypes, file: UploadFile) => {
    return (await fetch(`../api/templates/${templateId}/delete`)).ok
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Vorlagen</Title>
      <Form
        name="download-templates"
        layout="vertical"
      >
        <Form.Item>
          <Button
            type="primary"
            loading={isDownloadingTemplates && { delay: 200 }}
            icon={<DownloadOutlined />}
            onClick={() => {
              setIsDownloadingTemplates(true)
              setTimeout(() => setIsDownloadingTemplates(false), 3000)
            }}
            href='../api/templates/download'
          >
            Alle Vorlagen herunterladen
          </Button>
        </Form.Item>
        {uploadedTemplates && (Object.values(templateTypes)).map(templateId =>
          <Form.Item label={labels[templateId]} name={templateId} key={templateId}>
            <Upload
              multiple={false}
              maxCount={1}
              action={'../api/templates/upload'}
              customRequest={(options: UploadRequestOption) => uploadFile(templateId, options)}
              onChange={(change: UploadChangeParam<UploadFile>) => filesChanged(templateId, change)}
              accept='.docx'

              defaultFileList={uploadedTemplates[templateId] ? [{
                uid: templateId,
                name: uploadedTemplates[templateId].filename,
                status: 'done',
                url: downloadUrl(templateId),
              },] : []}

              onRemove={(file: UploadFile) => deleteFile(templateId, file)}

              showUploadList={{
                showDownloadIcon: true,
                downloadIcon: 'Herunterladen',
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </>
  )
}

export default TemplateConfigPage