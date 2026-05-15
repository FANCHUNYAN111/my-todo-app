const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 从请求头获取 token（前端会放在 Authorization: Bearer xxx）
  // const authHeader = req.headers.authorization;
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ error: '未提供 token 或格式错误' });
  }
  // const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'my_secret_key'); // 密钥必须与登录时一致
    req.userId = decoded.userId; // 将用户ID附加到请求对象上
    next();
  } catch (err) {

    return res.status(401).json({ error: 'token 无效或已过期' });
  }
}

module.exports = authMiddleware;