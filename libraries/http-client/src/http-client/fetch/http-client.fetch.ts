import type {
  IHttpClient,
  TRequestConfig,
  TResponseError,
  TRequestInterceptor,
  TResponseInterceptor,
  TUploadProgressCallback,
} from '../../types';

export default class HttpClientFetch implements IHttpClient {
  private readonly baseUrl: string;
  private requestInterceptors: Array<TRequestInterceptor> = [];
  private responseInterceptors: Array<TResponseInterceptor> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async request<Response>(config: TRequestConfig): Promise<Response> {
    const fullUrl = `${this.baseUrl}${config.url}`;
    const interceptedConfig = this.applyRequestInterceptors(config);

    return await this.fetchIt(fullUrl, interceptedConfig);
  }

  public async get<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'GET',
      url,
      headers: { Accept: 'application/json, text/plain, */*', ...headers },
      requestRetry: false,
      retryCount: 0,
    };

    return this.request<TResponse>(config);
  }

  public async post<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...headers,
      },
      url,
      body: JSON.stringify(payload),
      requestRetry: false,
      retryCount: 0,
    };

    return this.request<TResponse>(config);
  }

  public async upload<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
    onProgress?: TUploadProgressCallback,
  ): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        ...headers,
      },
      url,
      body: payload,
      requestRetry: false,
      retryCount: 0,
    };

    if (!onProgress) {
      return this.request<TResponse>(config);
    }

    const interceptedConfig = this.applyRequestInterceptors(config);
    const fullUrl = `${this.baseUrl}${url}`;

    const xhrResponse = await new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => resolve(this.toResponse(xhr, fullUrl)));
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', fullUrl);

      const resolvedHeaders = interceptedConfig.headers as Record<string, string> | undefined;
      if (resolvedHeaders) {
        Object.entries(resolvedHeaders).forEach(([name, value]) => {
          xhr.setRequestHeader(name, value);
        });
      }

      xhr.send(payload as XMLHttpRequestBodyInit);
    });

    return this.handleResponse<TResponse>(xhrResponse, interceptedConfig);
  }

  private toResponse(xhr: XMLHttpRequest, url: string): Response {
    const hasBody = ![101, 204, 205, 304].includes(xhr.status);
    const contentType =
      xhr.getResponseHeader('content-type') ??
      (this.isJson(xhr.responseText) ? 'application/json' : 'text/plain');
    const response = new Response(hasBody ? xhr.responseText : null, {
      status: xhr.status,
      headers: { 'content-type': contentType },
    });

    Object.defineProperty(response, 'url', { value: xhr.responseURL || url });

    return response;
  }

  private isJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  public async put<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'PUT',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...headers,
      },
      url,
      body: JSON.stringify(payload),
      requestRetry: false,
      retryCount: 0,
    };

    return this.request<TResponse>(config);
  }

  public async patch<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'PATCH',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...headers,
      },
      url,
      body: JSON.stringify(payload),
      requestRetry: false,
      retryCount: 0,
    };

    return this.request<TResponse>(config);
  }

  public async delete<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse> {
    const config: TRequestConfig = {
      method: 'DELETE',
      url,
      headers: { Accept: 'application/json, text/plain, */*', ...headers },
      requestRetry: false,
      retryCount: 0,
    };

    return this.request<TResponse>(config);
  }

  public addRequestInterceptor(interceptor: TRequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: TResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private applyRequestInterceptors(config: TRequestConfig): TRequestConfig {
    return this.requestInterceptors.reduce(
      (accConfig, interceptor) => interceptor.onRequest(accConfig),
      config,
    );
  }

  private async applyResponseInterceptors(
    response: Response,
    config: TRequestConfig,
  ): Promise<Response> {
    let current = response;

    for (const interceptor of this.responseInterceptors) {
      current = await interceptor.onResponse(current, config);
    }

    return current;
  }

  private parse(data: Response): Promise<any> {
    if (data.status === 204) {
      return data.text();
    }

    const contentType = data.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      return data.json();
    }

    return data.text();
  }

  private async normalizeError<Error>(
    error: Response,
    info: Error,
  ): Promise<TResponseError<Error>> {
    return {
      status: error.status,
      url: error.url,
      raw: error,
      data: info,
    };
  }

  private async fetchIt<TResponse>(url: string, config: TRequestConfig): Promise<TResponse> {
    return this.handleResponse<TResponse>(await fetch(url, config), config);
  }

  private async handleResponse<TResponse>(
    response: Response,
    config: TRequestConfig,
  ): Promise<TResponse> {
    const intercepted = await this.applyResponseInterceptors(response, config);

    if (!intercepted.ok) {
      throw await this.normalizeError(intercepted, await this.parse(intercepted));
    }

    return this.parse(intercepted);
  }
}
