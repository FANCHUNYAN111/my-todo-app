import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section>
        <span className="eyebrow">404</span>
        <h1>页面不存在</h1>
        <p>这个地址没有匹配到页面，可以回到任务首页继续管理你的清单。</p>
        <Link className="primary-button inline-button" to="/dashboard">
          <Home size={18} />
          返回首页
        </Link>
      </section>
    </main>
  );
}
