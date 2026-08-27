/** Counts from a Notra import run; limitReached means the plan cap stopped it. */
export type ImportSummary = {
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  truncatedCount: number;
  limitReached: boolean;
};

/** Success has summary; failure is a message-only object. */
export type ImportResponse =
  | {
      ok: true;
      summary: ImportSummary;
    }
  | {
      message?: string;
    };

/** Notra org link and whether credentials can be stored. */
export type NotraConnectionResponse = {
  connected: boolean;
  organizationId: string | null;
  canStore: boolean;
};
