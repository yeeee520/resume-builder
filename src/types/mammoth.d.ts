declare module 'mammoth' {
  interface MammothResult {
    value: string
    messages: Array<{ type: string; message: string; error?: Error }>
  }

  interface MammothOptions {
    arrayBuffer: ArrayBuffer
  }

  interface Mammoth {
    extractRawText(options: MammothOptions): Promise<MammothResult>
    convertToHtml(options: MammothOptions): Promise<MammothResult>
  }

  const mammoth: Mammoth
  export default mammoth
}
