import React, { useEffect, useState } from "react"
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons"
import { Upload as AntdUpload, Typography, Button, Form, UploadFile, message } from "antd"
import { UploadRequestOption } from "rc-upload/lib/interface"
import { DownloadInfo } from "../api/files/upload"
import { templateType, TemplateType, Upload, UploadType } from "src/types"
import { UploadChangeParam } from "antd/es/upload"
import { downloadUrl } from "src/core/lib/files"
import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { getAntiCSRFToken } from "@blitzjs/auth"
import { useQuery } from "@blitzjs/rpc"
import getTemplates from "src/core/queries/getTemplates"

const { Title } = Typography

export interface DonwloadRequestData extends DownloadInfo {
  originalFilename: string
  type: string
}

const TemplateConfigPage: BlitzPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const [uploadedTemplates, { setQueryData }] = useQuery(getTemplates, null)
  const [isDownloadingTemplates, setIsDownloadingTemplates] = useState(false)

  const filesChanged = async (change: UploadChangeParam<UploadFile>) => {
    const { response: template, status, error } = change.file

    if (status === "done") {
      change.file.url = downloadUrl(template!)
      uploadedTemplates.find((t) => t.id == template?.key)!.upload = template
      await setQueryData([...uploadedTemplates])
      await messageApi.success(`Uplaod erfolgreich`)
    } else if (status === "error") {
      console.error(error)
      await messageApi.error(`Upload fehlgeschlagen`)
    }
  }

  const labels = {
    [templateType.Ballot]: "Stimmzettel",
    [templateType.Results]: "Wahlergebnis-Protokoll",
    [templateType.Config]: "Konfiguration",
  }

  const uploadFile = async (templateId: TemplateType, options: UploadRequestOption<JSON>) => {
    const payload = new FormData()
    const antiCSRFToken = getAntiCSRFToken()
    payload.append("method", "db")
    payload.append("type", UploadType.TEMPLATE)
    payload.append("key", templateId)
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
          `Vorlage konnte nicht hochgeladen werden. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
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

  const deleteFile = async (templateId: TemplateType, file: UploadFile) => {
    return (await fetch(`../api/templates/${templateId}/delete`)).ok
  }

  return (
    <>
      {contextHolder}
      <Title style={{ marginTop: 0 }}>Vorlagen</Title>
      <Form name="download-templates" layout="vertical">
        <Form.Item>
          <Button
            type="primary"
            loading={isDownloadingTemplates && { delay: 200 }}
            icon={<DownloadOutlined />}
            onClick={() => {
              setIsDownloadingTemplates(true)
              setTimeout(() => setIsDownloadingTemplates(false), 3000)
            }}
            href="../api/templates/download"
          >
            Alle Vorlagen herunterladen
          </Button>
        </Form.Item>
        {uploadedTemplates &&
          uploadedTemplates.map((template) => (
            <Form.Item label={labels[template.id]} name={template.id} key={template.id}>
              <AntdUpload
                multiple={false}
                maxCount={1}
                action={"../api/files/upload"}
                customRequest={(options: UploadRequestOption) => uploadFile(template.id, options)}
                onChange={filesChanged}
                accept=".docx"
                defaultFileList={
                  template.upload
                    ? [
                        {
                          uid: template.id,
                          name: template.upload?.filename || "",
                          status: "done",
                          url: downloadUrl(template.upload),
                        },
                      ]
                    : []
                }
                onRemove={(file: UploadFile) => deleteFile(template.id, file)}
                showUploadList={{
                  showDownloadIcon: true,
                  downloadIcon: "Herunterladen",
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </AntdUpload>
            </Form.Item>
          ))}
      </Form>
    </>
  )
}

TemplateConfigPage.getLayout = (page) => <Layout title="Vorlagen">{page}</Layout>

export default TemplateConfigPage
