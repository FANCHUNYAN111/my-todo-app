export function createId() {
  // crypto.randomUUID 不是所有浏览器都支持，所以这里准备一个降级方案。
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
