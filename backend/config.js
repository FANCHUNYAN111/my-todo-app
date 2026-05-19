// config.js
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'my_secret_key', // 线上务必使用复杂密钥
  DATABASE_URL: process.env.DATABASE_URL
};