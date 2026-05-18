<template>
  <div class="register-container">
    <n-card title="注册" style="width: 400px">
      <n-form :model="form">
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="form.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>
        <n-button type="primary" block @click="handleRegister" :loading="loading"
          >注册</n-button
        >
        <div style="margin-top: 16px; text-align: center">
          <n-text>已有账号？</n-text>
          <n-button text @click="goToLogin">去登录</n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useMessage } from "naive-ui";

const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const form = ref({ email: "", password: "" });
const loading = ref(false);

async function handleRegister() {
  loading.value = true;
  const result = await userStore.register(form.value);
  loading.value = false;
  if (result.success) {
    message.success("注册并登录成功");
    router.push("/todos");
  } else {
    message.error(result.message || "注册失败");
  }
}

function goToLogin() {
  router.push("/login");
}
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}
</style>
