# HTTP‑клиент на основе Fetch API

Лёгкий типизированный HTTP‑клиент на основе `fetch` с поддержкой:

- базового URL;
- удобных методов (`get`, `post`, `put`, `patch`, `delete`, `upload`);
- перехватчиков запросов и ответов;
- нормализованной обработки ошибок.

<!-- TOC -->
* [HTTP‑клиент на основе Fetch API](#httpклиент-на-основе-fetch-api)
  * [Разработка](#разработка)
  * [Установка](#установка)
  * [Быстрый старт](#быстрый-старт)
  * [API](#api)
    * [Создание клиента](#создание-клиента)
    * [`get`](#get)
    * [`post`](#post)
    * [`upload`](#upload)
    * [`put`](#put)
    * [`patch`](#patch)
    * [`delete`](#delete)
    * [Перехватчики (interceptors)](#перехватчики-interceptors)
      * [Перехватчики запросов](#перехватчики-запросов)
      * [Перехватчики ответов](#перехватчики-ответов)
    * [Обработка ошибок](#обработка-ошибок)
    * [Особенности парсинга ответа](#особенности-парсинга-ответа)
    * [Типизация](#типизация)
<!-- TOC -->

## Разработка

Убедитесь, что git hooks являются исполняемыми:

```shell
chmod +x .git-hooks/pre-commit
```

Укажите локальный путь к файлу `.gitconfig`:

```shell
git config --local include.path ../.gitconfig
```

Для релиза новой версии:

```shell
npm run release
```

Для релиза бета-версии:

```shell
npm run pre-release
```

## Установка

```bash
npm install @iwyfaf-ts-kit/http-client
```

## Быстрый старт

```typescript
import { HttpClientFetch } from '@iwyfaf-ts-kit/http-client';

const httpClient = new HttpClientFetch('https://api.example.com');

// Пример GET-запроса
async function loadItems() {
  const items = await httpClient.get<{ id: number; name: string }[]>('/items');
  console.log(items);
}
```

## API

### Создание клиента

```typescript
import { HttpClientFetch } from '@iwyfaf-ts-kit/http-client';

const httpClient = new HttpClientFetch('https://api.example.com');
```

### `get`

Выполняет `GET`‑запрос. 

По умолчанию добавляет заголовок:

```text
Accept: application/json, text/plain, */*
```

```typescript
const user = await httpClient.get<{ id: number; name: string }>('/users/1');

const items = await httpClient.get('/items', {
  'X-Custom': 'value',
});
```

### `post`

Выполняет `POST`‑запрос с JSON‑телом.

По умолчанию добавляет заголовки:

```text
Accept: application/json, text/plain, */*
Content-Type: application/json
```

```typescript
type TCreateItemPayload = { name: string };
type TCreateItemResponse = { id: number; name: string };

const created = await httpClient.post<TCreateItemResponse, TCreateItemPayload>(
  '/items',
  { name: 'Новый элемент' },
);

const createdWithHeaders = await httpClient.post<TCreateItemResponse, TCreateItemPayload>(
  '/items',
  { name: 'Новый элемент' },
  { 'X-Trace-Id': '123' },
);
```

### `upload`

Выполняет `POST`‑запрос для загрузки файлов/сырых данных. 

Не устанавливает Content-Type принудительно — это позволяет корректно работать с FormData и др.

```typescript
const formData = new FormData();
formData.append('file', file);

const result = await httpClient.upload<{ url: string }>('/upload', formData);
```

### `put`

Выполняет `PUT`‑запрос с JSON‑телом. Заголовки по умолчанию аналогичны post.

```typescript
const updated = await httpClient.put<{ id: number; name: string }, { name: string }>(
  '/items/1',
  { name: 'Обновлённое имя' },
);
```

### `patch`

Выполняет `PATCH`‑запрос с JSON‑телом.

```typescript
const patched = await httpClient.patch<{ id: number; name?: string }, { name?: string }>(
  '/items/1',
  { name: 'Частично обновлённое имя' },
);
```

### `delete`

Выполняет `DELETE`‑запрос.

```typescript
await httpClient.delete<void>('/items/1');

const result = await httpClient.delete<{ deleted: boolean }>('/items/1', {
  'X-Reason': 'cleanup',
});
```

### Перехватчики (interceptors)

Клиент поддерживает два типа перехватчиков:

- перехватчики запросов (`TRequestInterceptor`);
- перехватчики ответов (`TResponseInterceptor`).

Они позволяют централизованно добавлять заголовки, логировать запросы/ответы, обрабатывать ошибки и т.п.

#### Перехватчики запросов

```typescript
import type { TRequestConfig, TRequestInterceptor } from '@iwyfaf-ts-kit/http-client';

const authInterceptor: TRequestInterceptor = {
  onRequest(config: TRequestConfig): TRequestConfig {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: 'Bearer token',
      },
    };
  },
};

httpClient.addRequestInterceptor(authInterceptor);
```

Перехватчики применяются по порядку регистрации.

#### Перехватчики ответов

```typescript
import type { TRequestConfig, TResponseInterceptor } from '@iwyfaf-ts-kit/http-client';

const responseInterceptor: TResponseInterceptor = {
  async onResponse(response, config: TRequestConfig): Promise<Response> {
    const res = await response;

    if (res.status === 401) {
      // например, выполнить логаут или обновление токена
      
      // Или выполнить повторно запрос
      await httpClient.request(config);
    }

    return res;
  },
};

httpClient.addResponseInterceptor(responseInterceptor);
```

Перехватчики ответов также применяются последовательно, в порядке добавления. Каждый перехватчик может вернуть 
новый/модифицированный `Response`.

### Обработка ошибок

Если `response.ok === false`, клиент выбрасывает нормализованную ошибку типа `TResponseError<Error>`:

```typescript
import type { TResponseError } from '@iwyfaf-ts-kit/http-client';

type ErrorBody = { message: string };

try {
  await httpClient.get('/items/1');
} catch (error) {
  const err = error as TResponseError<ErrorBody>;

  console.log(err.status); // HTTP‑статус
  console.log(err.url);    // URL запроса
  console.log(err.raw);    // оригинальный Response
  console.log(err.data);   // распарсенное тело ошибки
}
```

### Особенности парсинга ответа

Метод `parse` внутри клиента работает так:

- если статус ответа `204 No Content` — используется `response.text()` и возвращается строка;
- во всех остальных случаях — `response.json()` и возвращается результат парсинга JSON.

Это означает, что:

```typescript
const text = await httpClient.delete<string>('/items/1'); // при 204 вернётся ''
```

### Типизация

Из пакета можно импортировать типы для типизации конфигурации и ошибок:

```typescript
import type {
  TRequestConfig,
  TResponseError,
  TRequestInterceptor,
  TResponseInterceptor,
  IHttpClient,
} from '@iwyfaf-ts-kit/http-client';
```
 
