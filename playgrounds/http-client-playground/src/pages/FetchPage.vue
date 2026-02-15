<template>
  <h1>You did it!</h1>

  <button @click="doRequest">Post Request</button>
</template>

<script setup lang="ts">
import {
  HttpClientFetch,
  type TRequestConfig,
  type TRequestInterceptor,
  type TResponseError,
  type TResponseInterceptor,
} from '@iwyfaf-ts-kit/http-client';

const httpClient = new HttpClientFetch('https://cleaner.dadata.ru/api/v1/');

type TDaDataResponseError = {
  error: string;
  message: string;
  path: string;
  status: number;
  timestamp: string;
};

const requestInterceptor: TRequestInterceptor = {
  onRequest(config: TRequestConfig): TRequestConfig {
    const accessToken = import.meta.env['VITE_ACCESS_TOKEN'];
    const secretToken = import.meta.env['VITE_SECRET_TOKEN'];

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Token ${accessToken}`,
        'X-Secret': secretToken,
      },
    };
  },
};

httpClient.addRequestInterceptor(requestInterceptor);

const responseInterceptor: TResponseInterceptor = {
  async onResponse(response, config: TRequestConfig): Promise<Response> {
    const res = await response;

    if (res.status === 404 && config.retryCount < 2) {
      config.retryCount += 1;

      await httpClient.request(config);
    }

    return res;
  },
};

httpClient.addResponseInterceptor(responseInterceptor);

async function doRequest() {
  try {
    await httpClient.post('clean/address', ['мск сухонска 11/-89']);
  } catch (error: any) {
    console.log(error.data as TResponseError<TDaDataResponseError>, 'error');
  }
}
</script>
