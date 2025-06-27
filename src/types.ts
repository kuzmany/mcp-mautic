export interface MauticConfig {
  url: string;
  clientId: string;
  clientSecret: string;
}

export interface MauticContact {
  id?: number;
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  phone?: string;
  [key: string]: any;
}

export interface MauticContactsResponse {
  total: number;
  contacts: Record<string, MauticContact>;
}

export interface MauticTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface MauticApiError {
  error: {
    message: string;
    code: number;
  };
}

export interface ListContactsParams {
  limit?: number;
  search?: string;
  orderBy?: 'id' | 'email' | 'date_added';
  orderByDir?: 'asc' | 'desc';
  start?: number;
}

export interface MauticStatsResponse {
  total: number;
  stats: Record<string, any>;
}

export interface MauticDataResponse {
  data: any[];
  dateFormat: string;
  timeUnit: string;
  [key: string]: any;
}

export interface StatsParams {
  table?: string;
  start?: number;
  limit?: number;
  order?: Array<{col: string; dir: 'ASC' | 'DESC'}>;
  where?: Array<{col: string; expr: string; val: any}>;
}

export interface DataParams {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  timeUnit?: 'Y' | 'm' | 'W' | 'd' | 'H';
  filter?: {
    companyId?: number;
    campaignId?: number;
    segmentId?: number;
  };
}