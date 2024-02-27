import { Button, Upload as UploadComponent, Typography, Modal, Table } from "antd"
import type { UploadFile } from "antd"
import useUpload from "src/core/hooks/useUpload"
import { UploadChangeParam } from "antd/es/upload"
import { ImportResult } from "src/core/lib/import"
import { useCallback, useState } from "react"
import { UploadOutlined } from "@ant-design/icons"
import Link from "antd/lib/typography/Link"

export type ImportModalUploadField = {
  type: ImportModalUploadFieldType
  label: string
  action: string
  accept: string
}

export enum ImportModalUploadFieldType {
  BASIS,
  FACULTY,
  SUBJECT,
  STUDENT,
}

export type ImportResults = Partial<Record<ImportModalUploadFieldType, ImportResult>>

export interface ImportTableProps {
  uploadFields: ImportModalUploadField[]
  onFinishedDataImport: () => void | Promise<void>
}

const { Text } = Typography

const ImportTable = ({ uploadFields, onFinishedDataImport }: ImportTableProps) => {
  const [importResults, setImportResults] = useState<ImportResults>({})

  const [isUpdating, setIsUpdating] = useState(false)

  const updateDisplay = useCallback(async () => {
    setIsUpdating(true)
    try {
      await onFinishedDataImport()
    } finally {
      setIsUpdating(false)
    }
  }, [onFinishedDataImport])

  const {
    isUploading,
    messageApi,
    contextHolder,
    handleFileChange: _handleFileChange,
    uploadFile,
  } = useUpload()

  const handleFileChange = async (
    field: ImportModalUploadFieldType,
    change: UploadChangeParam<UploadFile>
  ) =>
    _handleFileChange(
      change,
      async (_, response: ImportResult) => {
        setImportResults({ ...importResults, [field]: response })
        await updateDisplay()
        void messageApi.success(`Upload erfolgreich`)
      },
      async (_, error) => {
        console.error(error)
        void messageApi.error(
          <>
            <Text strong>Upload fehlgeschlagen</Text>
            <br />
            <Text>{`${error}`}</Text>
          </>,
          10
        )
      }
    )

  const [showDetailsModal, setShowDetailsModal] = useState<
    Partial<Record<ImportModalUploadFieldType, boolean>>
  >({})
  const openDetailsModal = (type: ImportModalUploadFieldType) =>
    setShowDetailsModal({ ...showDetailsModal, [type]: true })
  const closeDetailsModal = (type: ImportModalUploadFieldType) =>
    setShowDetailsModal({ ...showDetailsModal, [type]: undefined })

  const ResultDetailsModal = ({
    type,
    result,
  }: {
    type: ImportModalUploadFieldType
    result: ImportResult
  }) => {
    return (
      <Modal
        title="Detaillierte Import-Ergebnisse"
        width={800}
        open={showDetailsModal[type]}
        onCancel={() => closeDetailsModal(type)}
        footer={[
          <Button key="back" type="primary" onClick={() => closeDetailsModal(type)}>
            Schließen
          </Button>,
        ]}
      >
        <Table
          size="small"
          pagination={false}
          dataSource={[...result.error, ...result.skipped].map((result) => {
            return { ...result, key: result.label }
          })}
          columns={[
            { title: "Datensatz", key: "label", dataIndex: "label" },
            { title: "Fehlermeldung", key: "error", dataIndex: "error" },
          ]}
        ></Table>
      </Modal>
    )
  }

  return (
    <>
      {contextHolder}
      <Table
        size="small"
        pagination={false}
        dataSource={uploadFields}
        columns={[
          { title: "Typ", key: "type", dataIndex: "label" },
          {
            key: "action",
            render: (_, record) => (
              <UploadComponent
                action={record.action}
                maxCount={1}
                showUploadList={false}
                onChange={(change) => handleFileChange(record.type, change)}
                customRequest={(options) => uploadFile(options, "basis")}
                accept={record.accept}
              >
                <Button icon={<UploadOutlined />} loading={isUploading || isUpdating}>
                  Importieren
                </Button>
              </UploadComponent>
            ),
          },
          {
            title: "Ergebnis",
            key: "result",
            dataIndex: "result",
            render: (_, record) => {
              const result = importResults[record.type]
              if (!result) return <></>
              if (result.skipped.length > 0 || result.error.length > 0) {
                return (
                  <>
                    {result.error.length > 0 && (
                      <Text type="danger" style={{ display: "block" }}>
                        {result.error.length} fehlgeschlagen
                      </Text>
                    )}
                    {result.skipped.length > 0 && (
                      <Text type="warning" style={{ display: "block" }}>
                        {result.skipped.length} übersprungen
                      </Text>
                    )}
                    <Text style={{ display: "block" }}>{result.success} importiert</Text>
                    <ResultDetailsModal type={record.type} result={result} />
                    <Link onClick={() => openDetailsModal(record.type)}>Details</Link>
                  </>
                )
              }
              return (
                <Text type="success">
                  Alle {importResults[record.type]!.success} Datensätze importiert
                </Text>
              )
            },
          },
        ]}
      />
    </>
  )
}

export default ImportTable
