import type { IHttpClient } from '../http-client.interface';
import type {
  TRequestConfig,
  TRequestInterceptor,
  TResponseError,
  TResponseInterceptor,
} from '../http-client.types';

/**
 * HTTP-клиент на основе Fetch API для выполнения запросов к удалённому серверу.
 *
 * @extends {IHttpClient}
 * Реализует интерфейс HTTP-клиента для унифицированной работы с запросами.
 *
 * @throws
 * Может выбрасывать ошибки сети, ошибки парсинга ответа или нормализованные ошибки ответа сервера.
 *
 * @example
 * const client = new HttpClientFetch('https://api.example.com');
 * const data = await client.get<{ id: number }[]>('/items');
 * console.log(data);
 */
export declare class HttpClientFetch implements IHttpClient {
  /**
   * Базовый URL, относительно которого формируются все запросы.
   */
  private readonly baseUrl: string;

  /**
   * Список интерсепторов, обрабатывающих конфигурацию запроса перед его выполнением.
   */
  private requestInterceptors: Array<TRequestInterceptor>;

  /**
   * Список интерсепторов, обрабатывающих ответ сервера и ошибки после выполнения запроса.
   */
  private responseInterceptors: Array<TResponseInterceptor>;

  /**
   * Создаёт экземпляр HTTP-клиента с указанным базовым URL.
   *
   * @param {string} baseUrl
   * Базовый адрес сервера, к которому будут выполняться HTTP-запросы.
   *
   * @example
   * const client = new HttpClientFetch('https://api.example.com');
   */
  constructor(baseUrl: string);

  /**
   * Выполняет HTTP-запрос с использованием переданной конфигурации.
   *
   * @param {TRequestConfig} config
   * Конфигурация запроса, включающая метод, URL, заголовки, тело и дополнительные параметры.
   *
   * @returns {Promise<Response>}
   * Промис, который разрешается с типизированным ответом сервера.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const response = await client.request<{ id: number }>({
   *   url: '/items/1',
   *   method: 'GET',
   * });
   */
  public request<Response>(config: TRequestConfig): Promise<Response>;

  /**
   * Выполняет HTTP GET-запрос по указанному URL.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const items = await client.get<{ id: number; name: string }[]>('/items');
   */
  public get<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse>;

  /**
   * Выполняет HTTP POST-запрос с передачей тела запроса.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {TPayload} payload
   * Тело запроса, которое будет отправлено на сервер.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const created = await client.post<{ id: number }, { name: string }>('/items', { name: 'Item' });
   */
  public post<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP-запрос для загрузки файлов или данных (upload).
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {TPayload} payload
   * Данные или форма, которые будут отправлены на сервер для загрузки.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const formData = new FormData();
   * formData.append('file', file);
   * const result = await client.upload<{ url: string }>('/upload', formData);
   */
  public upload<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP PUT-запрос с передачей тела запроса.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {TPayload} payload
   * Тело запроса, содержащее данные для полной замены ресурса.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const updated = await client.put<{ id: number }, { name: string }>('/items/1', { name: 'New' });
   */
  public put<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP PATCH-запрос с частичным обновлением ресурса.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {TPayload} payload
   * Тело запроса, содержащее данные для частичного обновления ресурса.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const patched = await client.patch<{ id: number }, { name?: string }>('/items/1', { name: 'Patch' });
   */
  public patch<TResponse, TPayload = object>(
    url: string,
    payload: TPayload,
    headers?: HeadersInit,
  ): Promise<TResponse>;

  /**
   * Выполняет HTTP DELETE-запрос по указанному URL.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, который необходимо удалить.
   *
   * @param {HeadersInit} [headers]
   * Дополнительные заголовки, которые будут добавлены к запросу.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа, если сервер его возвращает.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * await client.delete<void>('/items/1');
   */
  public delete<TResponse>(url: string, headers?: HeadersInit): Promise<TResponse>;

  /**
   * Добавляет интерсептор для предварительной обработки конфигурации запроса.
   *
   * @param {TRequestInterceptor} interceptor
   * Функция-интерсептор, которая может изменять конфигурацию запроса или прерывать его выполнение.
   *
   * @returns {void}
   * Ничего не возвращает.
   *
   * @example
   * client.addRequestInterceptor((config) => ({
   *   ...config,
   *   headers: { ...config.headers, Authorization: 'Bearer token' },
   * }));
   */
  public addRequestInterceptor(interceptor: TRequestInterceptor): void;

  /**
   * Добавляет интерсептор для обработки ответа или ошибки после выполнения запроса.
   *
   * @param {TResponseInterceptor} interceptor
   * Функция-интерсептор, которая может изменять ответ или обрабатывать ошибки.
   *
   * @returns {void}
   * Ничего не возвращает.
   *
   * @example
   * client.addResponseInterceptor(async (response, config) => {
   *   if (!response.ok) {
   *     // обработка ошибки
   *   }
   *   return response;
   * });
   */
  public addResponseInterceptor(interceptor: TResponseInterceptor): void;

  /**
   * Последовательно применяет все интерсепторы запроса к конфигурации.
   *
   * @param {TRequestConfig} config
   * Исходная конфигурация запроса, которая будет модифицирована интерсепторами.
   *
   * @returns {TRequestConfig}
   * Итоговая конфигурация запроса после применения всех интерсепторов.
   *
   * @example
   * const finalConfig = this.applyRequestInterceptors(initialConfig);
   */
  private applyRequestInterceptors(config: TRequestConfig): TRequestConfig;

  /**
   * Последовательно применяет все интерсепторы ответа к полученному ответу или промису ответа.
   *
   * @param {Response | Promise<Response>} response
   * Исходный ответ сервера или промис ответа, который будет обработан интерсепторами.
   *
   * @param {TRequestConfig} config
   * Конфигурация запроса, связанная с данным ответом.
   *
   * @returns {Response | Promise<Response>}
   * Ответ или промис ответа после применения всех интерсепторов.
   *
   * @example
   * const handledResponse = this.applyResponseInterceptors(fetchResponse, requestConfig);
   */
  private applyResponseInterceptors(
    response: Response | Promise<Response>,
    config: TRequestConfig,
  ): Response | Promise<Response>;

  /**
   * Парсит ответ сервера в удобный для использования формат (например, JSON).
   *
   * @param {Response} data
   * Исходный объект ответа Fetch API, полученный от сервера.
   *
   * @returns {Promise<any>}
   * Промис, который разрешается с распарсенным содержимым ответа.
   *
   * @example
   * const body = await this.parse(response);
   */
  private parse(data: Response): Promise<any>;

  /**
   * Нормализует ошибку ответа сервера в единый формат `TResponseError`.
   *
   * @param {Response} error
   * Исходный объект ответа с ошибкой, полученный от сервера.
   *
   * @param {Error} info
   * Дополнительная информация об ошибке, например объект исключения.
   *
   * @returns {Promise<TResponseError<Error>>}
   * Промис, который разрешается с нормализованным объектом ошибки.
   *
   * @example
   * const normalized = await this.normalizeError(responseWithError, originalError);
   */
  private normalizeError<Error>(error: Response, info: Error): Promise<TResponseError<Error>>;

  /**
   * Внутренний метод, выполняющий HTTP-запрос через Fetch API с учётом конфигурации.
   *
   * @param {string} url
   * Относительный или абсолютный путь ресурса, к которому выполняется запрос.
   *
   * @param {TRequestConfig} config
   * Конфигурация запроса, включающая метод, заголовки и тело.
   *
   * @returns {Promise<TResponse>}
   * Промис, который разрешается с типизированным телом ответа.
   *
   * @throws
   * Может выбрасывать ошибки сети, ошибки парсинга или нормализованные ошибки ответа.
   *
   * @example
   * const data = await this.fetchIt<{ id: number }>(url, config);
   */
  private fetchIt<TResponse>(url: string, config: TRequestConfig): Promise<TResponse>;
}
