import type {
  TRequestConfig,
  TRequestInterceptor,
  TResponseInterceptor,
} from './http-client.types';

/**
 * Интерфейс HTTP‑клиента для выполнения запросов и управления перехватчиками.
 */
export interface IHttpClient {
  /**
   * Выполняет HTTP‑запрос с использованием переданной конфигурации.
   *
   * @param {TRequestConfig} config
   * Конфигурация HTTP‑запроса, включающая метод, URL, заголовки и тело.
   *
   * @returns {Promise<TResponse>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети, таймаута или некорректной конфигурации запроса.
   *
   * @example
   * ```ts
   * const data = await httpClient.request<{ id: string }>({
   *   method: 'GET',
   *   url: '/api/items/1',
   * });
   * ```
   */
  request<TResponse>(config: TRequestConfig): Promise<TResponse>;

  /**
   * Выполняет HTTP‑запрос с методом GET по указанному URL.
   *
   * @param {string} url
   * Адрес ресурса, к которому выполняется GET‑запрос.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут отправлены вместе с запросом.
   *
   * @returns {Promise<Response>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети или при некорректном URL.
   *
   * @example
   * ```ts
   * const user = await httpClient.get<{ name: string }>('/api/user');
   * ```
   */
  get<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse>;

  /**
   * Выполняет HTTP‑запрос с методом POST по указанному URL.
   *
   * @param {string} url
   * Адрес ресурса, к которому выполняется POST‑запрос.
   *
   * @param {TPayload} payload
   * Тело запроса, которое будет отправлено на сервер.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут отправлены вместе с запросом.
   *
   * @returns {Promise<TResponse>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети или при некорректном теле запроса.
   *
   * @example
   * ```ts
   * const created = await httpClient.post<{ id: string }, { name: string }>(
   *   '/api/items',
   *   { name: 'Новый элемент' },
   * );
   * ```
   */
  post<TResponse, TPayload>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP‑запрос с методом PUT по указанному URL.
   *
   * @param {string} url
   * Адрес ресурса, к которому выполняется PUT‑запрос.
   *
   * @param {TPayload} payload
   * Полное новое состояние ресурса, которое будет отправлено на сервер.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут отправлены вместе с запросом.
   *
   * @returns {Promise<TResponse>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети или при некорректном теле запроса.
   *
   * @example
   * ```ts
   * const updated = await httpClient.put<{ id: string }, { name: string }>(
   *   '/api/items/1',
   *   { name: 'Обновлённое имя' },
   * );
   * ```
   */
  put<TResponse, TPayload>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP‑запрос с методом PATCH по указанному URL.
   *
   * @param {string} url
   * Адрес ресурса, к которому выполняется PATCH‑запрос.
   *
   * @param {TPayload} payload
   * Частичное обновление ресурса, которое будет отправлено на сервер.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут отправлены вместе с запросом.
   *
   * @returns {Promise<TResponse>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети или при некорректном теле запроса.
   *
   * @example
   * ```ts
   * const patched = await httpClient.patch<{ id: string }, Partial<{ name: string }>>(
   *   '/api/items/1',
   *   { name: 'Частично обновлённое имя' },
   * );
   * ```
   */
  patch<TResponse, TPayload>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP‑запрос с методом DELETE по указанному URL.
   *
   * @param {string} url
   * Адрес ресурса, который будет удалён.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут отправлены вместе с запросом.
   *
   * @returns {Promise<TResponse>}
   * Промис с результатом ответа, приведённым к типу `TResponse`.
   *
   * @throws
   * Может выбросить ошибку сети или при некорректном URL.
   *
   * @example
   * ```ts
   * await httpClient.delete<void>('/api/items/1');
   * ```
   */
  delete<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse>;

  /**
   * Регистрирует перехватчик запросов, который будет вызываться перед отправкой каждого запроса.
   *
   * @param {TRequestInterceptor} interceptor
   * Функция‑перехватчик, позволяющая изменять конфигурацию запроса или прерывать его.
   *
   * @returns {void}
   * Ничего не возвращает.
   *
   * @throws
   * Может выбросить ошибку при некорректной реализации перехватчика.
   *
   * @example
   * ```ts
   * httpClient.addRequestInterceptor((config) => {
   *   config.headers = { ...config.headers, Authorization: 'Bearer token' };
   *   return config;
   * });
   * ```
   */
  addRequestInterceptor(interceptor: TRequestInterceptor): void;

  /**
   * Регистрирует перехватчик ответов, который будет вызываться после получения ответа.
   *
   * @param {TResponseInterceptor} interceptor
   * Функция‑перехватчик, позволяющая обработать или изменить ответ перед его возвратом.
   *
   * @returns {void}
   * Ничего не возвращает.
   *
   * @throws
   * Может выбросить ошибку при некорректной обработке ответа в перехватчике.
   *
   * @example
   * ```ts
   * httpClient.addResponseInterceptor((response) => {
   *   if (!response.ok) {
   *     throw new Error('Ошибка ответа сервера');
   *   }
   *   return response;
   * });
   * ```
   */
  addResponseInterceptor(interceptor: TResponseInterceptor): void;
}
