<template>
  <h1>You did it!</h1>

  <button @click="doRequest">Post Request</button>

  <hr />

  <input type="file" @change="onFileChange" />
  <button :disabled="!file" @click="doUpload">Upload</button>

  <div v-if="isUploading">
    <progress :value="uploadProgress" max="100" />
    <span>{{ uploadProgress }}</span>
  </div>

  <div v-if="uploadResult">{{ uploadResult }}</div>
</template>

<script setup lang="ts">
import {
  HttpClientFetch,
  type TRequestConfig,
  type TRequestInterceptor,
  type TResponseError,
  type TResponseInterceptor,
  type TUploadProgressCallback,
} from '@iwyfaf-ts-kit/http-client';
import { ref } from 'vue';

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

function useUpload() {
  const file = ref<File | null>(null);
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const uploadResult = ref<string | null>(null);

  function onFileChange(e: Event) {
    file.value = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  async function doUpload() {
    if (!file.value) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file.value);

    const onProgress: TUploadProgressCallback = (percent) => {
      uploadProgress.value = percent;
    };

    isUploading.value = true;
    uploadProgress.value = 0;
    uploadResult.value = null;

    try {
      uploadResult.value = await httpClient.upload<string>('upload', formData, {}, onProgress);
    } catch (e) {
      console.error(e as TResponseError<unknown>);
    } finally {
      isUploading.value = false;
    }
  }

  return {
    file,
    isUploading,
    uploadProgress,
    uploadResult,
    onFileChange,
    doUpload,
  };
}

const { file, isUploading, uploadProgress, uploadResult, onFileChange, doUpload } = useUpload();
</script>
