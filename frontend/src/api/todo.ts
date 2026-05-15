import request from './request'

export interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  userId: number
}

// 获取所有任务
export function getTodosApi() {
  return request.get<any, Todo[]>('/api/todos')
}

// 创建任务
export function createTodoApi(title: string) {
  return request.post<any, Todo>('/api/todos', { title })
}

// 更新任务（通常只改 completed，但也可以改 title）
export function updateTodoApi(id: number, data: { title?: string; completed?: boolean }) {
  return request.put<any, Todo>(`/api/todos/${id}`, data)
}

// 删除任务
export function deleteTodoApi(id: number) {
  return request.delete(`/api/todos/${id}`)
}