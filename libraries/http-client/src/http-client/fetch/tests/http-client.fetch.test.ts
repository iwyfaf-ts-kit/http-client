import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import HttpClientFetch from '../http-client.fetch';
import type { TRequestConfig, TResponseError } from '../../../types';

describe('HttpClientFetch', () => {
  const BASE_URL = 'https://api.example.com';
  let client: HttpClientFetch;

  beforeEach(async () => {
    client = new HttpClientFetch(BASE_URL);
    global.fetch = vi.fn();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe('request', () => {
    it('Should call fetch with full url and config and return parsed json on success.', async () => {
      const responseBody = { id: 1, name: 'Test' };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof responseBody>(config);

      expect(global.fetch).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/items/1`, config);
      expect(result).toStrictEqual(responseBody);
    });

    it('Should reject with normalized error when response is not ok.', async () => {
      const errorBody = { message: 'Bad Request' };

      const mockResponse = {
        ok: false,
        status: 400,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(errorBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      let caughtError: TResponseError<typeof errorBody> | undefined;

      try {
        await client.request(config);
      } catch (error) {
        caughtError = error as TResponseError<typeof errorBody>;
      }

      expect(caughtError).toBeDefined();
      expect(caughtError?.status).toEqual(400);
      expect(caughtError?.url).toEqual(`${BASE_URL}/items/1`);
      expect(caughtError?.raw).toBe(mockResponse);
      expect(caughtError?.data).toStrictEqual(errorBody);
    });

    it('Should apply request interceptors before calling fetch.', async () => {
      const responseBody = { ok: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const interceptor = {
        onRequest(config: TRequestConfig): TRequestConfig {
          return {
            ...config,
            headers: {
              ...(config.headers ?? {}),
              Authorization: 'Bearer token',
            },
            requestRetry: false,
            retryCount: 0,
          };
        },
      };

      client.addRequestInterceptor(interceptor);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof responseBody>(config);

      expect(result).toStrictEqual(responseBody);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.headers).toBeDefined();
      expect((calledConfig.headers as Record<string, string>).Authorization).toEqual(
        'Bearer token',
      );
    });

    it('Should apply response interceptors before parsing response.', async () => {
      const originalBody = { id: 1 };
      const interceptedBody = { id: 1, intercepted: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(originalBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const interceptor = {
        async onResponse(response: Response | Promise<Response>): Promise<Response> {
          const resolved = await response;

          return {
            ...resolved,
            json: vi.fn().mockResolvedValue(interceptedBody),
          } as unknown as Response;
        },
      };

      client.addResponseInterceptor(interceptor);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof interceptedBody>(config);

      expect(result).toStrictEqual(interceptedBody);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('Should use json parser when content-type is application/json.', async () => {
      const responseBody = { id: 1 };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        headers: { get: vi.fn().mockReturnValue('application/json; charset=utf-8') },
        json: vi.fn().mockResolvedValue(responseBody),
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof responseBody>(config);

      expect(result).toStrictEqual(responseBody);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.text).not.toHaveBeenCalled();
    });

    it('Should use text parser when content-type is text/html.', async () => {
      const htmlBody = '<html><body>Not Found</body></html>';

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        headers: { get: vi.fn().mockReturnValue('text/html; charset=utf-8') },
        json: vi.fn(),
        text: vi.fn().mockResolvedValue(htmlBody),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<string>(config);

      expect(result).toEqual(htmlBody);
      expect(mockResponse.text).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('Should use text parser for 204 status code.', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        url: `${BASE_URL}/items/1`,
        json: vi.fn(),
        text: vi.fn().mockResolvedValue(''),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const config: TRequestConfig = {
        method: 'DELETE',
        url: '/items/1',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<string>(config);

      expect(result).toEqual('');
      expect(mockResponse.text).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('Should perform GET request with default Accept header and return parsed json.', async () => {
      const responseBody = [{ id: 1 }, { id: 2 }];

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.get<typeof responseBody>('/items');

      expect(result).toStrictEqual(responseBody);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const calledUrl = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledUrl).toEqual(`${BASE_URL}/items`);
      expect(calledConfig.method).toEqual('GET');
      expect(calledConfig.headers).toBeDefined();
      expect((calledConfig.headers as Record<string, string>).Accept).toEqual(
        'application/json, text/plain, */*',
      );
    });

    it('Should merge custom headers with default Accept header.', async () => {
      const responseBody = { ok: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.get<typeof responseBody>('/items', {
        'X-Custom': 'value',
      });

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['X-Custom']).toEqual('value');
    });
  });

  describe('post', () => {
    it('Should perform POST request with json body and headers and return parsed json.', async () => {
      const payload = { name: 'Item' };
      const responseBody = { id: 1, name: 'Item' };

      const mockResponse = {
        ok: true,
        status: 201,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.post<typeof responseBody, typeof payload>('/items', payload);

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.method).toEqual('POST');
      expect(calledConfig.body).toEqual(JSON.stringify(payload));

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['Content-Type']).toEqual('application/json');
    });

    it('Should merge custom headers with default POST headers.', async () => {
      const payload = { name: 'Item' };
      const responseBody = { id: 1 };

      const mockResponse = {
        ok: true,
        status: 201,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.post<typeof responseBody, typeof payload>('/items', payload, {
        'X-Custom': 'value',
      });

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['Content-Type']).toEqual('application/json');
      expect(headers['X-Custom']).toEqual('value');
    });
  });

  describe('upload', () => {
    it('Should perform POST upload request without forcing Content-Type and return parsed json.', async () => {
      const payload = { raw: true };
      const responseBody = { success: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/upload`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.upload<typeof responseBody, typeof payload>('/upload', payload);

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.method).toEqual('POST');
      expect(calledConfig.body).toBe(payload);

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['Content-Type']).toBeUndefined();
    });
  });

  describe('put', () => {
    it('Should perform PUT request with json body and headers and return parsed json.', async () => {
      const payload = { name: 'Updated' };
      const responseBody = { id: 1, name: 'Updated' };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.put<typeof responseBody, typeof payload>('/items/1', payload);

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.method).toEqual('PUT');
      expect(calledConfig.body).toEqual(JSON.stringify(payload));

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['Content-Type']).toEqual('application/json');
    });
  });

  describe('patch', () => {
    it('Should perform PATCH request with json body and headers and return parsed json.', async () => {
      const payload = { name: 'Patched' };
      const responseBody = { id: 1, name: 'Patched' };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.patch<typeof responseBody, typeof payload>('/items/1', payload);

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.method).toEqual('PATCH');
      expect(calledConfig.body).toEqual(JSON.stringify(payload));

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['Content-Type']).toEqual('application/json');
    });
  });

  describe('delete', () => {
    it('Should perform DELETE request with default Accept header and return parsed json.', async () => {
      const responseBody = { deleted: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.delete<typeof responseBody>('/items/1');

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      expect(calledConfig.method).toEqual('DELETE');

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
    });

    it('Should merge custom headers with default DELETE headers.', async () => {
      const responseBody = { deleted: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items/1`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await client.delete<typeof responseBody>('/items/1', {
        'X-Custom': 'value',
      });

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers.Accept).toEqual('application/json, text/plain, */*');
      expect(headers['X-Custom']).toEqual('value');
    });
  });

  describe('addRequestInterceptor', () => {
    it('Should register multiple request interceptors and apply them in order.', async () => {
      const responseBody = { ok: true };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(responseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const interceptor1 = {
        onRequest(config: TRequestConfig): TRequestConfig {
          return {
            ...config,
            headers: {
              ...(config.headers ?? {}),
              'X-First': '1',
            },
            requestRetry: false,
            retryCount: 0,
          };
        },
      };

      const interceptor2 = {
        onRequest(config: TRequestConfig): TRequestConfig {
          return {
            ...config,
            headers: {
              ...(config.headers ?? {}),
              'X-Second': '2',
            },
          };
        },
      };

      client.addRequestInterceptor(interceptor1);
      client.addRequestInterceptor(interceptor2);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof responseBody>(config);

      expect(result).toStrictEqual(responseBody);

      const calledConfig = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as TRequestConfig;

      const headers = calledConfig.headers as Record<string, string>;
      expect(headers['X-First']).toEqual('1');
      expect(headers['X-Second']).toEqual('2');
    });
  });

  describe('addResponseInterceptor', () => {
    it('Should register multiple response interceptors and apply them in order.', async () => {
      const baseBody = { step: 0 };
      const bodyAfterFirst = { step: 1 };
      const bodyAfterSecond = { step: 2 };

      const mockResponse = {
        ok: true,
        status: 200,
        url: `${BASE_URL}/items`,
        json: vi.fn().mockResolvedValue(baseBody),
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn(),
      } as unknown as Response;

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const interceptor1 = {
        async onResponse(response: Response | Promise<Response>): Promise<Response> {
          const resolved = await response;
          const newResponse = {
            ...resolved,
            json: vi.fn().mockResolvedValue(bodyAfterFirst),
          } as unknown as Response;
          return newResponse;
        },
      };

      const interceptor2 = {
        async onResponse(response: Response | Promise<Response>): Promise<Response> {
          const resolved = await response;
          const newResponse = {
            ...resolved,
            json: vi.fn().mockResolvedValue(bodyAfterSecond),
          } as unknown as Response;
          return newResponse;
        },
      };

      client.addResponseInterceptor(interceptor1);
      client.addResponseInterceptor(interceptor2);

      const config: TRequestConfig = {
        method: 'GET',
        url: '/items',
        requestRetry: false,
        retryCount: 0,
      };

      const result = await client.request<typeof bodyAfterSecond>(config);

      expect(result).toStrictEqual(bodyAfterSecond);
    });
  });
});
