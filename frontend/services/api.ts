const API_BASE_URL = 'http://192.168.1.105:3000/api'; // Use local network IP for physical device access

export interface IssueReport {
  id?: number;
  description: string;
  category: string;
  status?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  city?: {
    id: number;
    name: string;
  };
  locality?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface CreateIssueRequest {
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // In a real app, you would get the auth token from storage
    // For demo purposes, we'll use a simple approach
    return {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const authHeaders = await this.getAuthHeaders();
    const defaultOptions: RequestInit = {
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async createIssue(issueData: CreateIssueRequest, cityId: number = 1, localityId: number = 1): Promise<IssueReport> {
    return this.request<IssueReport>(`/issues/city/${cityId}/locality/${localityId}`, {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async getAllIssues(): Promise<IssueReport[]> {
    return this.request<IssueReport[]>('/issues');
  }

  async getIssue(id: number): Promise<IssueReport> {
    return this.request<IssueReport>(`/issues/${id}`);
  }

  async getIssuesByStatus(status: string): Promise<IssueReport[]> {
    return this.request<IssueReport[]>(`/issues/status/${status}`);
  }

  async getIssuesByCategory(category: string): Promise<IssueReport[]> {
    return this.request<IssueReport[]>(`/issues/category/${category}`);
  }

  async getIssuesByCity(cityId: number): Promise<IssueReport[]> {
    return this.request<IssueReport[]>(`/issues/city/${cityId}`);
  }

  async getIssuesByLocality(localityId: number): Promise<IssueReport[]> {
    return this.request<IssueReport[]>(`/issues/locality/${localityId}`);
  }

  async updateIssueStatus(id: number, status: string): Promise<IssueReport> {
    return this.request<IssueReport>(`/issues/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  async updateIssueLocation(id: number, cityId: number, localityId: number): Promise<IssueReport> {
    return this.request<IssueReport>(`/issues/${id}/location?cityId=${cityId}&localityId=${localityId}`, {
      method: 'PATCH',
    });
  }

  async deleteIssue(id: number): Promise<void> {
    return this.request<void>(`/issues/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
