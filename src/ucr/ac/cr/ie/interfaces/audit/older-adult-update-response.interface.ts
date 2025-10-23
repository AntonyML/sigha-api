export interface OlderAdultUpdateResponse {
  id: number;
  fieldChanged: string;
  oldValue?: string;
  newValue?: string;
  changedAt: Date;
  olderAdultId: number;
  changedBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginatedOlderAdultUpdatesResponse {
  updates: OlderAdultUpdateResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
