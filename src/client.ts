import { MauticAuth } from './auth.js';
import { 
  MauticConfig, 
  MauticContact, 
  MauticContactsResponse, 
  MauticApiError,
  ListContactsParams,
  MauticStatsResponse,
  MauticDataResponse,
  StatsParams,
  DataParams,
  MauticAsset,
  MauticAssetsResponse,
  ListAssetsParams,
  MauticSegment,
  MauticSegmentsResponse,
  ListSegmentsParams
} from './types.js';

export class MauticClient {
  private auth: MauticAuth;
  private config: MauticConfig;

  constructor(config: MauticConfig) {
    this.config = config;
    this.auth = new MauticAuth(config);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.auth.getAccessToken();
    const url = `${this.config.url}/api${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error: MauticApiError = data;
      throw new Error(`API Error ${response.status}: ${error.error?.message || 'Unknown error'}`);
    }

    return data;
  }

  async listContacts(params: ListContactsParams = {}): Promise<MauticContactsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.orderBy) searchParams.set('orderBy', params.orderBy);
    if (params.orderByDir) searchParams.set('orderByDir', params.orderByDir);
    if (params.start) searchParams.set('start', params.start.toString());
    if (params.minimal !== undefined) searchParams.set('minimal', params.minimal.toString());

    const endpoint = `/contacts${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest<MauticContactsResponse>(endpoint);
  }

  async createContact(contact: Omit<MauticContact, 'id'>): Promise<{ contact: MauticContact }> {
    return this.makeRequest<{ contact: MauticContact }>('/contacts/new', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async getContact(id: number): Promise<{ contact: MauticContact }> {
    return this.makeRequest<{ contact: MauticContact }>(`/contacts/${id}`);
  }

  async updateContact(id: number, contact: Partial<MauticContact>): Promise<{ contact: MauticContact }> {
    return this.makeRequest<{ contact: MauticContact }>(`/contacts/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: number): Promise<{ contact: MauticContact }> {
    return this.makeRequest<{ contact: MauticContact }>(`/contacts/${id}/delete`, {
      method: 'DELETE',
    });
  }

  // Statistics endpoints
  async getStats(params: StatsParams = {}): Promise<MauticStatsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.start) searchParams.set('start', params.start.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.order) {
      params.order.forEach((order, index) => {
        searchParams.set(`order[${index}][col]`, order.col);
        searchParams.set(`order[${index}][dir]`, order.dir);
      });
    }
    if (params.where) {
      params.where.forEach((where, index) => {
        searchParams.set(`where[${index}][col]`, where.col);
        searchParams.set(`where[${index}][expr]`, where.expr);
        searchParams.set(`where[${index}][val]`, where.val.toString());
      });
    }

    const table = params.table || '';
    const endpoint = `/stats${table ? '/' + table : ''}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest<MauticStatsResponse>(endpoint);
  }

  async getData(params: DataParams = {}): Promise<MauticDataResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params.timeUnit) searchParams.set('timeUnit', params.timeUnit);
    if (params.filter?.companyId) searchParams.set('filter[companyId]', params.filter.companyId.toString());
    if (params.filter?.campaignId) searchParams.set('filter[campaignId]', params.filter.campaignId.toString());
    if (params.filter?.segmentId) searchParams.set('filter[segmentId]', params.filter.segmentId.toString());

    const type = params.type || '';
    const endpoint = `/data${type ? '/' + type : ''}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest<MauticDataResponse>(endpoint);
  }

  async getContactActivity(contactId: number, params: { search?: string; includeEvents?: string[]; excludeEvents?: string[]; } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.set('search', params.search);
    if (params.includeEvents) searchParams.set('includeEvents', params.includeEvents.join(','));
    if (params.excludeEvents) searchParams.set('excludeEvents', params.excludeEvents.join(','));

    const endpoint = `/contacts/${contactId}/activity${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  // Asset methods
  async listAssets(params: ListAssetsParams = {}): Promise<MauticAssetsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.orderBy) searchParams.set('orderBy', params.orderBy);
    if (params.orderByDir) searchParams.set('orderByDir', params.orderByDir);
    if (params.start) searchParams.set('start', params.start.toString());
    if (params.publishedOnly) searchParams.set('publishedOnly', 'true');
    if (params.minimal !== undefined) searchParams.set('minimal', params.minimal.toString());

    const endpoint = `/assets${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest<MauticAssetsResponse>(endpoint);
  }

  async getAsset(id: number): Promise<{ asset: MauticAsset }> {
    return this.makeRequest<{ asset: MauticAsset }>(`/assets/${id}`);
  }

  async createAsset(asset: Omit<MauticAsset, 'id'>): Promise<{ asset: MauticAsset }> {
    return this.makeRequest<{ asset: MauticAsset }>('/assets/new', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
  }

  async updateAsset(id: number, asset: Partial<MauticAsset>): Promise<{ asset: MauticAsset }> {
    return this.makeRequest<{ asset: MauticAsset }>(`/assets/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(asset),
    });
  }

  async deleteAsset(id: number): Promise<{ asset: MauticAsset }> {
    return this.makeRequest<{ asset: MauticAsset }>(`/assets/${id}/delete`, {
      method: 'DELETE',
    });
  }

  // Segment methods
  async listSegments(params: ListSegmentsParams = {}): Promise<MauticSegmentsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.orderBy) searchParams.set('orderBy', params.orderBy);
    if (params.orderByDir) searchParams.set('orderByDir', params.orderByDir);
    if (params.start) searchParams.set('start', params.start.toString());
    if (params.publishedOnly) searchParams.set('publishedOnly', 'true');
    if (params.minimal !== undefined) searchParams.set('minimal', params.minimal.toString());

    const endpoint = `/segments${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return this.makeRequest<MauticSegmentsResponse>(endpoint);
  }

  async getSegment(id: number): Promise<{ list: MauticSegment }> {
    return this.makeRequest<{ list: MauticSegment }>(`/segments/${id}`);
  }

  async createSegment(segment: Omit<MauticSegment, 'id'>): Promise<{ list: MauticSegment }> {
    return this.makeRequest<{ list: MauticSegment }>('/segments/new', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  async updateSegment(id: number, segment: Partial<MauticSegment>): Promise<{ list: MauticSegment }> {
    return this.makeRequest<{ list: MauticSegment }>(`/segments/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(segment),
    });
  }

  async deleteSegment(id: number): Promise<{ list: MauticSegment }> {
    return this.makeRequest<{ list: MauticSegment }>(`/segments/${id}/delete`, {
      method: 'DELETE',
    });
  }

  async addContactToSegment(segmentId: number, contactId: number): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/segments/${segmentId}/contact/${contactId}/add`, {
      method: 'POST',
    });
  }

  async removeContactFromSegment(segmentId: number, contactId: number): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/segments/${segmentId}/contact/${contactId}/remove`, {
      method: 'POST',
    });
  }
}