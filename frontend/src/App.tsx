import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    // Routes 是 React Router 的路由表：path 表示地址，element 表示这个地址要显示的页面。
    <Routes>
      {/* 访问根路径时自动跳转到任务首页。 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          // ProtectedRoute 会检查登录状态，未登录时不允许进入 Dashboard。
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* * 可以匹配所有未定义的地址，用来显示 404 页面。 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
