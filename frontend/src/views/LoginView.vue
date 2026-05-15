<template>
  <div class="login-container">
    <n-card title="登录" style="width: 400px">
      <n-form :model="form" ref="formRef">
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="form.email"
            placeholder="请输入邮箱"
          />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>
        <n-button type="primary" block @click="handleLogin" :loading="loading">
          登录
        </n-button>
        <div style="margin-top: 16px; text-align: center">
          <n-text>还没有账号？</n-text>
          <n-button text @click="goToRegister">去注册</n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMessage } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

// 关键修改：使用 reactive 而不是 ref
const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

async function handleLogin() {
  console.log('提交的表单数据:', form)  // 现在应该能看到 email 和 password
  loading.value = true
  const result = await userStore.login(form)
  loading.value = false
  if (result.success) {
    message.success('登录成功')
  } else {
    message.error(result.message || '登录失败')
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}
</style>