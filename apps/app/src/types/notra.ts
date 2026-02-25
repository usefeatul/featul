export type ImportSummary = {
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  truncatedCount: number;
  limitReached: boolean;
};

export type ImportResponse =
  | {
      ok: true;
      summary: ImportSummary;
    }
  | {
      message?: string;
    };

export type NotraConnectionResponse = {
  connected: boolean;
  organizationId: string | null;
  canStore: boolean;
};
