<template>
  <ul>
    <li v-for="route in routes">
      <router-link :to="route.path">{{ route.name }}</router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { routes } from '@/router';
</script>
