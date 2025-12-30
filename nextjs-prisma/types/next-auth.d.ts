import  { DefaultSession } from "next-auth";
//import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number
    numrender: number
    text: string
    version: string
  }

  function pdf(dataBuffer: Buffer): Promise<PDFData>
  
  export = pdf
}