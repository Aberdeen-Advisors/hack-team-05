export type DocType =
  | "case-study"
  | "proposal"
  | "services"
  | "credentials"
  | "culture"
  | "boilerplate"
  | "market-research"
  | "unknown";

export type ArmoryDoc = {
  driveItemId: string;
  docName: string;
  docType: DocType;
  webUrl: string;
  lastModified: string;
  eTag: string;
  mimeType?: string;
  size?: number;
  text: string;
};

export type ArmoryChunk = {
  id: string;
  driveItemId: string;
  docName: string;
  docType: DocType;
  webUrl: string;
  sectionPath: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
};

export type Citation = {
  driveItemId: string;
  docName: string;
  docType: DocType;
  webUrl: string;
  quote: string;
  chunkId: string;
};

export type RetrieveHit = {
  chunk: ArmoryChunk;
  score: number;
};
