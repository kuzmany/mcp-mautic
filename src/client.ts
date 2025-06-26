import { MauticAuth } from './auth.js';
import { 
  MauticConfig, 
  MauticContact, 
  MauticContactsResponse, 
  MauticApiError,
  ListContactsParams 
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
}