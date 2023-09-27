import { NextRequest } from 'next/server'
import { generateWorkbook } from '@/lib/excel/basis'
import mime from 'mime'

export async function GET(req: NextRequest) {
  const xlsxBuffer = await generateWorkbook().xlsx.writeBuffer()

  return new Response(xlsxBuffer, {
    headers: {
      "content-type": `${(mime.getType("xlsx") || '')}; charset=utf-8`,
      "content-disposition": `attachment; filename="basis"`,
      "content-length": `${xlsxBuffer.byteLength}`
    },
  })
}