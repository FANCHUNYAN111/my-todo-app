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
          <n-button
            type="warning"
            @click="deleteCompletedTodos"
            :loading="deletingCompleted"
          >
            批量删除已完成
          </n-button>
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
import { NButton,useMessage, NSwitch,  NPopconfirm, NInput } from 'naive-ui'
import { getTodosApi, createTodoApi, updateTodoApi, deleteTodoApi,deleteCompletedTodosApi , type Todo } from '@/api/todo'

const userStore = useUserStore()
const message = useMessage()

const todos = ref<Todo[]>([])
const loading = ref(false)
const adding = ref(false)
const newTodoTitle = ref('')
// 记录正在编辑的任务 id，null 表示没有在编辑
const editingId = ref<number | null>(null)
const editingTitle = ref('')
const deletingCompleted = ref(false)

async function deleteCompletedTodos() {
  deletingCompleted.value = true
  try {
    const res = await deleteCompletedTodosApi()
    message.success(res?.message || `删除了 ${res?.count} 个任务`)
    // 重新加载任务列表，或者直接从本地列表中过滤掉 completed 的任务
    await loadTodos()  // 简单重新加载
  } catch (err: any) {
    message.error(err.response?.data?.error || '批量删除失败')
  } finally {
    deletingCompleted.value = false
  }
}
// 定义表格列（使用 Naive UI 的渲染函数）
const columns = [
  {
    title: '状态',
    key: 'completed',
    width: 80,
    render(row: Todo) {
      return h(NSwitch, {
        value: row.completed,
        onUpdateValue: (val: boolean) => toggleComplete(row, val)},)
    }
  },

{
  title: '任务标题',
  key: 'title',
  ellipsis: true,
  render(row: Todo) {
    // 如果当前行正在编辑，显示输入框
    if (editingId.value === row.id) {
      return h(NInput, {
        value: editingTitle.value,
        onUpdateValue: (val: string) => editingTitle.value = val,
        onBlur: () => saveTitle(row.id),
        onKeypress: (e: KeyboardEvent) => {
          if (e.key === 'Enter') saveTitle(row.id)
        },
        autofocus: true,
        size: 'small'
      })
    }
    // 否则显示文本，并绑定双击事件
    return h('span', {
      style: row.completed ? 'text-decoration: line-through; color: #999; cursor: pointer' : 'cursor: pointer',
      ondblclick: () => startEdit(row)
    }, row.title)
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
function startEdit(todo: Todo) {
  editingId.value = todo.id
  editingTitle.value = todo.title
}

async function saveTitle(id: number) {
  const newTitle = editingTitle.value.trim()
  if (!newTitle) {
    message.warning('标题不能为空')
    editingId.value = null
    return
  }
  // 找到原任务
  const todo = todos.value.find(t => t.id === id)
  if (!todo) return
  const oldTitle = todo.title
  // 乐观更新
  todo.title = newTitle
  editingId.value = null
  try {
    await updateTodoApi(id, { title: newTitle })
    message.success('修改成功')
  } catch (err: any) {
    // 失败回滚
    todo.title = oldTitle
    message.error(err.response?.data?.error || '修改失败')
  }
}
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
