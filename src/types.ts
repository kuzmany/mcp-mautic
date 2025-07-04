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
  minimal?: boolean;
  fullResponse?: boolean;
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

// Asset types
export interface MauticAsset {
  id?: number;
  title: string;
  description?: string;
  alias?: string;
  language?: string;
  isPublished?: boolean;
  publishUp?: string;
  publishDown?: string;
  downloadCount?: number;
  uniqueDownloadCount?: number;
  revision?: number;
  category?: string;
  storageLocation?: 'local' | 'remote';
  path?: string;
  remotePath?: string;
  originalFileName?: string;
  lang?: string;
  size?: number;
  disallow?: boolean;
  [key: string]: any;
}

export interface MauticAssetsResponse {
  total: number;
  assets: Record<string, MauticAsset>;
}

export interface ListAssetsParams {
  limit?: number;
  search?: string;
  orderBy?: 'id' | 'title' | 'alias' | 'downloadCount';
  orderByDir?: 'asc' | 'desc';
  start?: number;
  publishedOnly?: boolean;
  minimal?: boolean;
}

// Segment types
export interface MauticSegment {
  id?: number;
  name: string;
  alias?: string;
  description?: string;
  isPublished?: boolean;
  publishUp?: string;
  publishDown?: string;
  filters?: Array<{
    glue?: string;
    field?: string;
    object?: string;
    type?: string;
    operator?: string;
    properties?: Record<string, any>;
    filter?: any;
  }>;
  [key: string]: any;
}

export interface MauticSegmentsResponse {
  total: number;
  lists: Record<string, MauticSegment>;
}

export interface ListSegmentsParams {
  limit?: number;
  search?: string;
  orderBy?: 'id' | 'name' | 'alias';
  orderByDir?: 'asc' | 'desc';
  start?: number;
  publishedOnly?: boolean;
  minimal?: boolean;
}

// Email types
export interface MauticEmail {
  id?: number;
  name: string;
  subject?: string;
  fromAddress?: string;
  fromName?: string;
  replyToAddress?: string;
  customHtml?: string;
  plainText?: string;
  isPublished?: boolean;
  publishUp?: string;
  publishDown?: string;
  emailType?: 'list' | 'template';
  language?: string;
  readCount?: number;
  sentCount?: number;
  revision?: number;
  category?: string;
  lists?: Array<{
    id: number;
    name: string;
  }>;
  [key: string]: any;
}

export interface MauticEmailsResponse {
  total: number;
  emails: Record<string, MauticEmail>;
}

export interface ListEmailsParams {
  limit?: number;
  search?: string;
  orderBy?: 'id' | 'name' | 'subject' | 'dateAdded';
  orderByDir?: 'asc' | 'desc';
  start?: number;
  publishedOnly?: boolean;
  minimal?: boolean;
}

export interface SendEmailParams {
  contactId: number;
  tokens?: Record<string, string>;
}

export interface SendEmailResponse {
  success: boolean;
  details?: any;
}