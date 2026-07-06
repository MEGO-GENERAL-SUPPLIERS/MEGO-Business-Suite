// src/services/apiClient.ts
import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig 
} from 'axios';
import { 
  getApiConfig, 
  getUserAuth,
  isBrowser 
} from '../utils/localStorageUtils';

// ====== IApiResponse Interface ======
export interface IApiResponse<T = any>{
  success: boolean;
  message?: string | string[] | null | undefined;
  data?: T; 
  metadata?: any;
  error?: any;
}

// ====== ENHANCED ERROR TYPES ======
export interface ApiErrorDetail {
  status: number;
  code?: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  message: string;
  details: ApiErrorDetail;
  originalError?: unknown;

  constructor(
    message: string,
    details: ApiErrorDetail,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.message = message;
    this.details = details;
    this.originalError = originalError;
  }
}

// ====== SMART BASE URL BUILDER ======
const buildBaseUrl = (config: ReturnType<typeof getApiConfig>): string => {
  const { protocol, host, port, baseUrl = '' } = config;
  
  // Skip default ports
  const portSuffix = 
    (protocol === 'http' && port === '80') || 
    (protocol === 'https' && port === '443')
      ? '' 
      : `:${port}`;
  
  // Normalize baseUrl (ensure single leading slash, no trailing slash)
  const normalizedBase = baseUrl
    .replace(/\/+$/, '')
    .replace(/^([^/])/, '/$1');
  
  return `${protocol}://${host}${portSuffix}${normalizedBase}`;
};

// ====== MAIN API CLIENT ======
class ApiClientClass {
  private instance: AxiosInstance;
  private pendingRequests = new Map<string, AbortController>();

  constructor() {
    // SSR Safety Gate
    if (!isBrowser()) {
      throw new Error(
        'ApiClient cannot be instantiated on server-side. ' +
        'Use only in client-side effects or actions.'
      );
    }

    this.instance = axios.create({
      timeout: getApiConfig().timeout,
      withCredentials: getApiConfig().withCredentials,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mego-admin-pro'
      }
    });

    this.setupInterceptors();
  }

  // ====== INTERCEPTORS WITH INTELLIGENT HANDLING ======
  private setupInterceptors() {
    // Request: Inject token + abort handling
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Abort handling
        const key = `${config.method}:${config.url}`;
        if (this.pendingRequests.has(key)) {
          this.pendingRequests.get(key)?.abort();
        }
        
        const controller = new AbortController();
        this.pendingRequests.set(key, controller);
        config.signal = controller.signal;

        // fix  FormDta uploads
        if(config.data instanceof FormData){
          delete config.headers['Content-Type'];
        }

        // Inject auth token
        const auth = getUserAuth();
        if (auth.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        } else{
          delete config.headers.Authorization;
        }
        
        // Add request ID for tracing
        const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        config.headers['X-Request-ID'] = requestId;
        
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response: Normalize success responses
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Clean up pending request
        const key = `${response.config.method}:${response.config.url}`;
        this.pendingRequests.delete(key);
        
        // Normalize non-standard API responses
        if (typeof response.data === 'object' && response.data !== null) {
          return response;
        }
        
        // Wrap primitive responses
        return {
          ...response,
          data: { 
            success: true, 
            data: response.data, 
            message: 'Operation successful' 
          }
        };
      },
      (error: any) => {
        const key = `${error.config?.method}:${error.config?.url}`;
        this.pendingRequests.delete(key);
        
        // Handle different error types
        if (axios.isCancel(error)) {
          return Promise.reject(new ApiError(
            'Request cancelled by user',
            { status: 0, code: 'CANCELLED' },
            error
          ));
        }

        if (!error.response) {
          // Network error / no response
          return Promise.reject(new ApiError(
            error.message || 'Network error - check connection',
            { 
              status: 0, 
              code: error.code || 'NETWORK_ERROR',
              details: { url: error.config?.url }
            },
            error
          ));
        }

        // Standardize error details
        const { status, data } = error.response;
        const details: ApiErrorDetail = {
          status,
          code: data?.code || `HTTP_${status}`,
          timestamp: data?.timestamp,
          path: data?.path || error.config?.url,
          details: data?.details
        };

        // Special handling for common cases
        let message = data?.message || data?.error || 'Request failed';
        
        if (status === 401) {
          message = 'Please log in again.';
          // Optional: Trigger logout flow here
          // window.dispatchEvent(new Event('auth:session-expired'));
        } else if (status === 403) {
          message = 'Access denied. Insufficient permissions.';
        } else if (status === 429) {
          message = `Too many requests. Try again in ${data?.retryAfter || 60} seconds.`;
        } else if (status >= 500) {
          message = 'Server error. Please try again later.';
        }

        return Promise.reject(new ApiError(message, details, error));
      }
    );
  }

  // ====== CORE REQUEST HANDLER ======
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    dataOrConfig?: unknown,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      // Dynamic config refresh (critical for token changes)
      const currentConfig = getApiConfig();
      this.instance.defaults.baseURL = buildBaseUrl(currentConfig);
      this.instance.defaults.timeout = currentConfig.timeout;
      
      let response: AxiosResponse;
      
      switch (method) {
        case 'get':
          response = await this.instance.get(url, config);
          break;
        case 'post':
          response = await this.instance.post(url, dataOrConfig, config);
          break;
        case 'put':
          response = await this.instance.put(url, dataOrConfig, config);
          break;
        case 'delete':
          response = await this.instance.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Normalize response to IApiResponse contract
      const apiResponse = response.data;
      
      // Handle non-standard API responses
      if (!('success' in apiResponse)) {
        return {
          success: true,
          message: 'Operation successful',
          data: apiResponse as T,
          metadata: { 
            status: response.status,
            requestId: response.headers['x-request-id']
          }
        };
      }
      
      return {
        ...apiResponse,
        metadata: {
          ...apiResponse.metadata,
          status: response.status,
          requestId: response.headers['x-request-id'] || apiResponse.metadata?.requestId
        }
      } as IApiResponse<T>;
      
    } catch (error: any) {
      // Convert all errors to standardized IApiResponse
      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
          data: null as unknown as T,
          error: {
            code: error.details.code,
            status: error.details.status,
            details: error.details.details
          },
          metadata: { 
            status: error.details.status,
            timestamp: error.details.timestamp 
          }
        };
      }
      
      // Fallback for unexpected errors
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null as unknown as T,
        error: { code: 'UNKNOWN_ERROR' },
        metadata: { status: -1 }
      };
    }
  }

  // ====== PUBLIC METHODS ======
  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('get', url, undefined, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('post', url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('put', url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('delete', url, undefined, config);
  }

  // ====== UTILITY METHODS ======
  cancelAllRequests(reason = 'Cancelled by client') {
    this.pendingRequests.forEach((controller, key) => {
      controller.abort(reason);
      this.pendingRequests.delete(key);
    });
  }

  refreshConfig() {
    const config = getApiConfig();
    this.instance.defaults.baseURL = buildBaseUrl(config);
    this.instance.defaults.timeout = config.timeout;
  }
}

// ====== SINGLETON PATTERN (BROWSER ONLY) ======
let apiClientInstance: ApiClientClass | null = null;

export const ApiClient = (): ApiClientClass => {
  if (!isBrowser()) {
    throw new Error('ApiClient only available in browser context');
  }
  
  if (!apiClientInstance) {
    apiClientInstance = new ApiClientClass();
  }
  return apiClientInstance;
};

// Default export for existing import patterns
export default ApiClient;