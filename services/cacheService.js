/**
 * 简单的内存缓存服务
 * 用于缓存accessToken等频繁使用的数据
 */

class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 设置缓存项
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} ttl 过期时间（毫秒）
   */
  set(key, value, ttl) {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl : null
    };
    this.cache.set(key, item);
    console.log(`缓存设置: ${key}, 过期时间: ${item.expiry ? new Date(item.expiry).toISOString() : '永不过期'}`);
  }

  /**
   * 获取缓存项
   * @param {string} key 缓存键
   * @returns {any|null} 缓存值或null（如果不存在或已过期）
   */
  get(key) {
    const item = this.cache.get(key);
    
    // 缓存不存在
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expiry && Date.now() > item.expiry) {
      console.log(`缓存已过期: ${key}`);
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存项
   * @param {string} key 缓存键
   */
  delete(key) {
    this.cache.delete(key);
    console.log(`缓存已删除: ${key}`);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    console.log('所有缓存已清空');
  }

  /**
   * 获取缓存项数量
   * @returns {number} 缓存项数量
   */
  size() {
    return this.cache.size;
  }
}

// 导出单例实例
const cacheService = new CacheService();
module.exports = cacheService;