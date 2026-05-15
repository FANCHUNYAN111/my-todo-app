<template>
  <!-- 先把 n-config-provider 放在最外层，再把 n-message-provider 包在里面 -->
  <n-config-provider>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
</script>