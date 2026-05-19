import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi, registerApi, type LoginParams, type RegisterParams } from '@/api/auth'
import { useRouter } from 'vue-router'

// 定义 API 错误响应结构
interface ApiErrorResponse {
    response?: {
        data?: {
            error?: string
        }
    }
}

export const useUserStore = defineStore('user', () => {
    const token = ref<string | null>(localStorage.getItem('token'))
    const userId = ref<number | null>(Number(localStorage.getItem('userId')) || null)

    const router = useRouter()

    // 辅助函数：安全提取错误消息
    const getErrorMessage = (err: unknown, defaultMsg: string): string => {
        const apiErr = err as ApiErrorResponse
        return apiErr?.response?.data?.error || defaultMsg
    }

    async function login(loginData: LoginParams) {
        try {
            const res = await loginApi(loginData)
            token.value = res.token
            userId.value = res.userId
            console.log(res)
            localStorage.setItem('token', res.token)
            localStorage.setItem('userId', String(res.userId))
            await router.push('/todos')
            return { success: true }
        } catch (err) {
            const errorMsg = getErrorMessage(err, '登录失败')
            return { success: false, message: errorMsg }
        }
    }

    async function register(registerData: RegisterParams) {
        try {
            const res = await registerApi(registerData)
            // 注册成功后自动登录
            return await login(registerData)
        } catch (err) {
            const errorMsg = getErrorMessage(err, '注册失败')
            return { success: false, message: errorMsg }
        }
    }

    function logout() {
        token.value = null
        userId.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
    }

    return { token, userId, login, register, logout }
})