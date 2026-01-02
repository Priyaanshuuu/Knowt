declare module "pdfjs-dist/legacy/build/pdf.js" {
  export interface GlobalWorkerOptions {
    workerSrc: string
  }

  export interface PDFDocumentProxy {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPageProxy>
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>
  }

  export interface TextContent {
    items: TextItem[]
  }

  export interface TextItem {
    str: string
    [key: string]: unknown
  }

  export interface DocumentInitParameters {
    data: Uint8Array
    useWorkerFetch?: boolean
    isEvalSupported?: boolean
    useSystemFonts?: boolean
  }

  export interface PDFLoadingTask {
    promise: Promise<PDFDocumentProxy>
  }

  export function getDocument(params: DocumentInitParameters): PDFLoadingTask

  export const GlobalWorkerOptions: GlobalWorkerOptions
}