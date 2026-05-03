export type Result<TRow> = {
    rows: TRow[];
    total: number;
    nextCursor: string | null;
    previousCursor: string | null;
  };