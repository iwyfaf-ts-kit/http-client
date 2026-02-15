/**
 * Конфигурация HTTP-запроса для функции выборки данных.
 *
 * @example
 * const config: TRequestConfig = {
 *   method: 'GET',
 *   url: 'https://api.example.com/users',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({ name: 'John Doe' }),
 * };
 */
export type TRequestConfig = {
  /**
   * HTTP-метод, используемый для выполнения запроса.
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /**
   * Набор заголовков, которые будут отправлены вместе с запросом.
   */
  headers?: HeadersInit | undefined;

  /**
   * URL-адрес ресурса, к которому выполняется HTTP-запрос.
   */
  url?: string | URL;

  /**
   * Тело HTTP-запроса, отправляемое на сервер.
   */
  body?: any;

  /**
   * Флаг, указывающий, должен ли запрос быть повторно выполнен при определённых условиях.
   *
   * Используется механизмами ретраев (например, в перехватчиках ответа), чтобы включать или
   * отключать повторные попытки для конкретного запроса.
   */
  requestRetry: boolean;

  /**
   * Текущее количество выполненных попыток запроса.
   *
   * Может инкрементироваться перехватчиками или внутренней логикой клиента при повторных запросах
   * (ретраях), чтобы ограничивать максимальное число попыток.
   */
  retryCount: number;
};

/**
 * Структура ошибки, возникающей при выполнении HTTP-запроса.
 *
 * @example
 * const error: TResponseError<Error> = {
 *   status: 500,
 *   message: 'Internal Server Error',
 *   url: 'https://api.example.com/users',
 *   extra: { retry: true },
 *   raw: response,
 * };
 *
 * @throws
 * Используется для представления ошибки, возникающей при обработке HTTP-ответа.
 */
export type TResponseError<Error> = {
  /**
   * HTTP-статус код, полученный от сервера.
   */
  status: number;

  /**
   * URL, по которому был выполнен запрос, приведший к ошибке.
   */
  url: string;

  /**
   * Исходный объект ответа `Response`, полученный от `fetch`.
   */
  raw: Response;

  /**
   * Текстовое описание ошибки, полученной при запросе.
   */
  data: Error;
};

/**
 * Интерцептор запроса, позволяющий модифицировать конфигурацию перед отправкой.
 *
 * @example
 * const requestInterceptor: TRequestInterceptor = {
 *   onRequest(config) {
 *     return {
 *       ...config,
 *       headers: {
 *         ...config.headers,
 *         Authorization: 'Bearer token',
 *       },
 *     };
 *   },
 * };
 */
export type TRequestInterceptor = {
  /**
   * Обработчик, вызываемый перед выполнением HTTP-запроса для изменения конфигурации.
   *
   * @param {TRequestConfig} config
   * Исходная конфигурация HTTP-запроса, которую можно изменить перед отправкой.
   *
   * @returns {TRequestConfig}
   * Обновлённая конфигурация HTTP-запроса, которая будет использована при выполнении запроса.
   *
   * @example
   * const interceptor: TRequestInterceptor = {
   *   onRequest(config) {
   *     return {
   *       ...config,
   *       headers: {
   *         ...config.headers,
   *         'X-Custom-Header': 'value',
   *       },
   *     };
   *   },
   * };
   */
  onRequest(config: TRequestConfig): TRequestConfig;
};

/**
 * Интерцептор ответа, позволяющий обработать или модифицировать HTTP-ответ.
 *
 * @example
 * const responseInterceptor: TResponseInterceptor = {
 *   async onResponse(response, config) {
 *     const resolvedResponse = await response;
 *     if (!resolvedResponse.ok) {
 *       // обработка ошибки
 *     }
 *     return resolvedResponse;
 *   },
 * };
 *
 * @throws
 * Может инициировать выброс ошибки при обработке неуспешного HTTP-ответа.
 */
export type TResponseInterceptor = {
  /**
   * Обработчик, вызываемый после получения HTTP-ответа для его анализа или изменения.
   *
   * @param {Response | Promise<Response>} response
   * Ответ `fetch` или промис, разрешающийся в `Response`, который необходимо обработать.
   *
   * @param {TRequestConfig} config
   * Конфигурация HTTP-запроса, использованная при выполнении данного запроса.
   *
   * @returns {Promise<Response>}
   * Промис, разрешающийся в (возможно модифицированный) объект `Response` после обработки.
   *
   * @example
   * const interceptor: TResponseInterceptor = {
   *   async onResponse(response, config) {
   *     const res = await response;
   *     if (res.status === 401) {
   *       // например, выполнить логаут или обновление токена
   *     }
   *     return res;
   *   },
   * };
   */
  onResponse(response: Response | Promise<Response>, config: TRequestConfig): Promise<Response>;
};
