import { getAntiCSRFToken } from "@blitzjs/auth"
import { message } from "antd"
import { MessageInstance } from "antd/es/message/interface"
import { UploadChangeParam, UploadFile } from "antd/es/upload"
import { UploadFileStatus } from "antd/es/upload/interface"
import { UploadRequestOption } from "rc-upload/lib/interface"
import { useState } from "react"
import { UploadType } from "src/types"

export interface UseUploadProps {
  onFinish: (status: UploadFileStatus, messageApi: MessageInstance) => Promise<void> | void
  onError: (
    status: UploadFileStatus,
    error: any,
    messageApi: MessageInstance
  ) => Promise<void> | void
}

const useUpload = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async <T>(
    change: UploadChangeParam<UploadFile>,
    onFinish: (status: UploadFileStatus, response: T) => Promise<void> | void,
    onError: (status: UploadFileStatus, error: any) => Promise<void> | void
  ) => {
    const { status, error, response } = change.file

    if (status === "done") {
      await onFinish(status, response)
    } else if (status === "error") {
      await onError(status, error)
    }
  }

  const uploadFile = async (options: UploadRequestOption<JSON>, key?: string) => {
    setIsUploading(true)
    const payload = new FormData()
    const antiCSRFToken = getAntiCSRFToken()
    payload.append("type", UploadType.DATA)
    if (key) payload.append("key", key)
    payload.append("file", options.file)
    try {
      const response = await fetch(options.action, {
        method: "POST",
        headers: {
          "anti-csrf": antiCSRFToken,
        },
        body: payload,
      })
      if (response.status == 400)
        throw new Error(
          `Die Basisdatei hat fehlerhaften Inhalt. Bitte korrigieren Sie die Datei und laden Sie sie erneut hoch. Fehler: ${await response.text()}`
        )
      if (response.status !== 200)
        throw new Error(
          `Basisdatei konnte nicht hochgeladen werden. Bitte wenden Sie sich an die Systemadministration. Fehler: ${
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
    setIsUploading(false)
  }

  return {
    isUploading,
    setIsUploading,
    messageApi,
    contextHolder,
    handleFileChange,
    uploadFile,
  }
}

export default useUpload
