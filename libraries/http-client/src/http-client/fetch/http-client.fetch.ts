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

    return new Promise<TResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        const data = this.parseXhrResponse<TResponse>(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const error: TResponseError<TResponse> = {
            status: xhr.status,
            url: xhr.responseURL,
            raw: new Response(xhr.responseText, { status: xhr.status }),
            data,
          };
          reject(error);
        }
      });

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
  }

  private parseXhrResponse<T>(responseText: string): T {
    try {
      return JSON.parse(responseText) as T;
    } catch {
      return responseText as unknown as T;
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

  private applyResponseInterceptors(
    response: Response | Promise<Response>,
    config: TRequestConfig,
  ): Response | Promise<Response> {
    return this.responseInterceptors.reduce(
      (accResponse, interceptor) => interceptor.onResponse(accResponse, config),
      response,
    );
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
    return new Promise((resolve, reject) => {
      fetch(url, config)
        .then(async (response: Response) => {
          const interceptedResponse = this.applyResponseInterceptors(response, config);

          if (!response.ok) {
            reject(await this.normalizeError(response, await this.parse(response)));
            return;
          }

          resolve(this.parse(await interceptedResponse));
        })
        .catch(reject);
    });
  }
}
