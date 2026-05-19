import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="brand-mark">
            <CheckCircle2 size={22} />
            Todo Tag Manager
          </span>
          <h1>让任务、标签和截止日期都清清楚楚。</h1>
          <p>登录后进入你的个人 Dashboard，管理任务、筛选标签、追踪完成进度。</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">欢迎回来</span>
          <h2>登录账户</h2>
          {error && <p className="form-error">{error}</p>}

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
              required
            />
          </label>

          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? '登录中...' : '登录'}
          </button>
          <p className="auth-switch">
            还没有账户？ <Link to="/register">去注册</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
