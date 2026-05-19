import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    try {
      setSubmitting(true);
      await register({ username, email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--reverse">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">创建账户</span>
          <h2>开始管理任务</h2>
          {error && <p className="form-error">{error}</p>}

          <label>
            用户名
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="例如：Alex"
              required
            />
          </label>

          <label>
            邮箱
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            密码
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位"
              minLength={6}
              required
            />
          </label>

          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? '注册中...' : '注册并进入'}
          </button>
          <p className="auth-switch">
            已有账户？ <Link to="/login">去登录</Link>
          </p>
        </form>

        <div className="auth-copy">
          <span className="brand-mark">
            <Sparkles size={22} />
            Todo Tag Manager
          </span>
          <h1>为 CRUD 练习准备的一套完整任务系统。</h1>
          <p>包含本地用户隔离、任务标签、状态筛选、搜索、分页和统计，足够展示一个完整前端作品。</p>
        </div>
      </section>
    </main>
  );
}
