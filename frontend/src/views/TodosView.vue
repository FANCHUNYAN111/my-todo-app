<template>
  <div class="todos-container">
    <n-card title="我的任务列表">
      <template #header-extra>
        <n-button type="error" size="small" @click="userStore.logout">退出登录</n-button>
      </template>

      <!-- 添加任务输入框 -->
      <n-space vertical>
        <n-space>
          <n-input
            v-model:value="newTodoTitle"
            placeholder="输入新任务标题"
            @keyup.enter="addTodo"
            style="width: 300px"
          />
          <n-button type="primary" @click="addTodo" :loading="adding">添加</n-button>
        </n-space>

        <!-- 任务列表 -->
        <n-data-table
          :columns="columns"
          :data="todos"
          :loading="loading"
          :bordered="true"
          style="margin-top: 16px"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useMessage, NButton, NSwitch, NTag, NPopconfirm } from 'naive-ui'
import { getTodosApi, createTodoApi, updateTodoApi, deleteTodoApi, type Todo } from '@/api/todo'

const userStore = useUserStore()
const message = useMessage()

const todos = ref<Todo[]>([])
const loading = ref(false)
const adding = ref(false)
const newTodoTitle = ref('')

// 定义表格列（使用 Naive UI 的渲染函数）
const columns = [
  {
    title: '状态',
    key: 'completed',
    width: 80,
    render(row: Todo) {
      return h(NSwitch, {
        value: row.completed,
        onUpdateValue: (val: boolean) => toggleComplete(row, val),
        size: 'small'
      })
    }
  },
  {
    title: '任务标题',
    key: 'title',
    ellipsis: true,
    render(row: Todo) {
      return row.completed
        ? h('span', { style: 'text-decoration: line-through; color: #999' }, row.title)
        : row.title
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row: Todo) {
      return new Date(row.createdAt).toLocaleString()
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row: Todo) {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => deleteTodo(row.id),
        },
        {
          trigger: () => h(NButton, { size: 'small', type: 'error', text: true }, '删除'),
          // 修改点：default 插槽返回 VNode 而非字符串
          default: () => h('span', '确定要删除这个任务吗？'),
        }
      )
    }
  }
]

// 加载所有任务
async function loadTodos() {
  loading.value = true
  try {
    const data = await getTodosApi()
    todos.value = data
    console.log(data)
  } catch (err: any) {
    message.error(err.response?.data?.error || '加载任务失败')
  } finally {
    loading.value = false
  }
}

// 添加任务
async function addTodo() {
  const title = newTodoTitle.value.trim()
  if (!title) {
    message.warning('请输入任务标题')
    return
  }
  adding.value = true
  try {
    const newTodo = await createTodoApi(title)
    todos.value.unshift(newTodo) // 添加到列表最前面
    newTodoTitle.value = ''
    message.success('添加成功')
  } catch (err: any) {
    message.error(err.response?.data?.error || '添加失败')
  } finally {
    adding.value = false
  }
}

// 切换完成状态
async function toggleComplete(todo: Todo, completed: boolean) {
  const originalCompleted = todo.completed
  // 乐观更新（立即更新 UI）
  todo.completed = completed
  try {
    await updateTodoApi(todo.id, { completed })
    message.success(completed ? '已完成' : '已取消完成')
  } catch (err: any) {
    // 失败时回滚
    todo.completed = originalCompleted
    message.error(err.response?.data?.error || '状态更新失败')
  }
}

// 删除任务
async function deleteTodo(id: number) {
  try {
    await deleteTodoApi(id)
    todos.value = todos.value.filter(t => t.id !== id)
    message.success('删除成功')
  } catch (err: any) {
    message.error(err.response?.data?.error || '删除失败')
  }
}

// 页面加载时获取任务列表
onMounted(() => {
  loadTodos()
})
</script>

<style scoped lang="scss">
.todos-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>