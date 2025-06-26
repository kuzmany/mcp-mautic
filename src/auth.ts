import { MauticConfig, MauticTokenResponse } from './types.js';

export class MauticAuth {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private config: MauticConfig;

  constructor(config: MauticConfig) {
    this.config = config;
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.token && Date.now() < (this.tokenExpiry - 60000)) {
      return this.token;
    }

    await this.refreshToken();
    
    if (!this.token) {
      throw new Error('Failed to obtain access token');
    }
    
    return this.token;
  }

  private async refreshToken(): Promise<void> {
    const url = `${this.config.url}/oauth/v2/token`;
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Token request failed: ${response.status} ${errorData}`);
      }

      const data: MauticTokenResponse = await response.json();
      
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  isTokenExpired(): boolean {
    return !this.token || Date.now() >= this.tokenExpiry;
  }
}