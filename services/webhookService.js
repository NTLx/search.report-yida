const crypto = require('crypto');

/**
 * WebHook服务 - 处理查询事件的WebHook通知
 */
class WebHookService {
  constructor() {
    // 从环境变量获取WebHook URL
    this.webhookUrl = process.env.WEBHOOK_URL;
    // 请求超时时间（毫秒）
    this.timeout = parseInt(process.env.WEBHOOK_TIMEOUT || '10000'); // 默认10秒
    // 最大重试次数
    this.maxRetries = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3'); // 默认3次
    // 重试延迟基数（毫秒）
    this.retryDelayBase = parseInt(process.env.WEBHOOK_RETRY_DELAY_BASE || '1000'); // 默认1秒

    // 检查是否启用了WebHook功能
    this.isEnabled = !!(this.webhookUrl && this.webhookUrl.trim() !== '');

    if (this.isEnabled) {
      console.log(`WebHook服务已启用，目标URL: ${this.webhookUrl}`);
    } else {
      console.log('WebHook服务未启用（未设置WEBHOOK_URL环境变量）');
    }
  }

  /**
   * 生成唯一查询ID
   * @returns {string} 查询ID
   */
  generateQueryId() {
    return `query_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * 发送WebHook通知
   * @param {Object} eventData - 事件数据
   * @param {string} eventData.messageType - 消息类型（如：search）
   * @param {string} eventData.queryId - 查询唯一标识符
   * @param {Object} eventData.parameters - 查询参数
   * @param {Object} eventData.resultSummary - 查询结果摘要
   * @param {string} eventData.status - 查询状态（success, error, partial）
   * @param {string} [eventData.userId] - 用户标识（如适用）
   * @param {number} [eventData.timestamp] - 事件时间戳（默认为当前时间）
   * @param {Object} [eventData.metadata] - 其他元数据
   * @returns {Promise<boolean>} 是否发送成功
   */
  async sendNotification(eventData) {
    // 如果未启用WebHook功能，直接返回成功
    if (!this.isEnabled) {
      return true;
    }

    try {
      // 构建完整的WebHook数据
      const webhookData = {
        messageType: eventData.messageType || 'search',
        queryId: eventData.queryId || this.generateQueryId(),
        timestamp: eventData.timestamp || Date.now(),
        parameters: eventData.parameters || {},
        resultSummary: eventData.resultSummary || {},
        status: eventData.status || 'unknown',
        userId: eventData.userId || null,
        metadata: eventData.metadata || {},
        // 添加系统信息
        system: {
          source: 'Report-YiDa',
          version: '1.3.0',
          environment: process.env.NODE_ENV || 'production'
        }
      };

      // 记录完整的WebHook内容（用于调试）
      if (process.env.NODE_ENV !== 'test') {
        console.log(`发送WebHook通知 - 查询ID: ${webhookData.queryId}`);
        console.log(`WebHook内容: ${JSON.stringify(webhookData, null, 2)}`);
      }

      // 发送WebHook请求（带重试机制）
      await this.sendWithRetry(webhookData);

      console.log(`WebHook通知发送成功: ${webhookData.queryId}`);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('发送WebHook通知失败:', error.message);
      }
      // 不抛出错误，避免影响主流程
      return false;
    }
  }

  /**
   * 带重试机制的发送请求
   * @param {Object} data - 要发送的数据
   * @param {number} retryCount - 当前重试次数
   * @returns {Promise<void>}
   */
  async sendWithRetry(data, retryCount = 0) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Report-YiDa-WebHook/1.0.0'
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout)
      });

      // 检查响应状态码
      if (!response.ok) {
        throw new Error(`WebHook服务器返回错误状态码: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // 如果还有重试次数，则进行重试
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelayBase * Math.pow(2, retryCount); // 指数退避
        if (process.env.NODE_ENV !== 'test') {
          console.log(`WebHook请求失败，${delay}ms后进行第${retryCount + 1}次重试: ${error.message}`);
        }

        // 等待指定时间
        await new Promise(resolve => setTimeout(resolve, delay));

        // 递归重试
        return this.sendWithRetry(data, retryCount + 1);
      }

      // 重试次数用完，抛出错误
      throw new Error(`WebHook请求失败，已达到最大重试次数(${this.maxRetries}): ${error.message}`);
    }
  }

  /**
   * 创建查询开始事件数据
   * @param {Object} queryParams - 查询参数
   * @param {string} [userId] - 用户标识
   * @returns {Object} 事件数据
   */
  createQueryStartEvent(queryParams, userId = null) {
    // 处理查询参数，使其更适合WebHook通知
    let processedParams = {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
      pageSize: queryParams.pageSize,
      currentPage: queryParams.currentPage
    };

    // 根据搜索类型添加相应的参数
    if (queryParams.searchType === 'nameAndPhone' && queryParams.searchValue) {
      processedParams.searchType = 'nameAndPhone';
      processedParams.name = queryParams.searchValue.name;
      processedParams.phone = queryParams.searchValue.phone;
    } else if (queryParams.searchType === 'name' && queryParams.searchValue) {
      processedParams.searchType = 'name';
      processedParams.name = queryParams.searchValue;
    } else if (queryParams.searchType === 'phone' && queryParams.searchValue) {
      processedParams.searchType = 'phone';
      processedParams.phone = queryParams.searchValue;
    }

    return {
      messageType: 'search',
      status: 'started',
      parameters: processedParams,
      userId,
      metadata: {
        phase: 'query_start',
        userAgent: null // 可在调用时设置
      }
    };
  }

  /**
   * 创建查询完成事件数据
   * @param {Object} queryParams - 查询参数
   * @param {Object} resultSummary - 查询结果摘要
   * @param {string} status - 查询状态
   * @param {string} queryId - 查询ID
   * @param {string} [userId] - 用户标识
   * @returns {Object} 事件数据
   */
  createQueryCompleteEvent(queryParams, resultSummary, status, queryId, userId = null) {
    // 处理查询参数，使其更适合WebHook通知
    let processedParams = {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
      pageSize: queryParams.pageSize,
      currentPage: queryParams.currentPage
    };

    // 根据搜索类型添加相应的参数
    if (queryParams.searchType === 'nameAndPhone' && queryParams.searchValue) {
      processedParams.searchType = 'nameAndPhone';
      processedParams.name = queryParams.searchValue.name;
      processedParams.phone = queryParams.searchValue.phone;
    } else if (queryParams.searchType === 'name' && queryParams.searchValue) {
      processedParams.searchType = 'name';
      processedParams.name = queryParams.searchValue;
    } else if (queryParams.searchType === 'phone' && queryParams.searchValue) {
      processedParams.searchType = 'phone';
      processedParams.phone = queryParams.searchValue;
    }

    return {
      messageType: 'search',
      status,
      queryId,
      parameters: processedParams,
      resultSummary,
      userId,
      metadata: {
        phase: 'query_complete',
        processingTime: Date.now() - (queryId ? parseInt(queryId.split('_')[1]) : Date.now())
      }
    };
  }

  /**
   * 创建查询失败事件数据
   * @param {Object} queryParams - 查询参数
   * @param {string} errorMessage - 错误信息
   * @param {string} queryId - 查询ID
   * @param {string} [userId] - 用户标识
   * @returns {Object} 事件数据
   */
  createQueryFailedEvent(queryParams, errorMessage, queryId, userId = null) {
    // 处理查询参数，使其更适合WebHook通知
    let processedParams = {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
      pageSize: queryParams.pageSize,
      currentPage: queryParams.currentPage
    };

    // 根据搜索类型添加相应的参数
    if (queryParams.searchType === 'nameAndPhone' && queryParams.searchValue) {
      processedParams.searchType = 'nameAndPhone';
      processedParams.name = queryParams.searchValue.name;
      processedParams.phone = queryParams.searchValue.phone;
    } else if (queryParams.searchType === 'name' && queryParams.searchValue) {
      processedParams.searchType = 'name';
      processedParams.name = queryParams.searchValue;
    } else if (queryParams.searchType === 'phone' && queryParams.searchValue) {
      processedParams.searchType = 'phone';
      processedParams.phone = queryParams.searchValue;
    }

    return {
      messageType: 'search',
      status: 'error',
      queryId,
      parameters: processedParams,
      errorMessage,
      userId,
      metadata: {
        phase: 'query_failed',
        processingTime: Date.now() - (queryId ? parseInt(queryId.split('_')[1]) : Date.now())
      }
    };
  }

  /**
   * 创建查询无结果事件数据
   * @param {Object} queryParams - 查询参数
   * @param {string} queryId - 查询ID
   * @param {string} [userId] - 用户标识
   * @returns {Object} 事件数据
   */
  createQueryNoResultsEvent(queryParams, queryId, userId = null) {
    // 处理查询参数，使其更适合WebHook通知
    let processedParams = {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
      pageSize: queryParams.pageSize,
      currentPage: queryParams.currentPage
    };

    // 根据搜索类型添加相应的参数
    if (queryParams.searchType === 'nameAndPhone' && queryParams.searchValue) {
      processedParams.searchType = 'nameAndPhone';
      processedParams.name = queryParams.searchValue.name;
      processedParams.phone = queryParams.searchValue.phone;
    } else if (queryParams.searchType === 'name' && queryParams.searchValue) {
      processedParams.searchType = 'name';
      processedParams.name = queryParams.searchValue;
    } else if (queryParams.searchType === 'phone' && queryParams.searchValue) {
      processedParams.searchType = 'phone';
      processedParams.phone = queryParams.searchValue;
    }

    return {
      messageType: 'search',
      status: 'no_results',
      queryId,
      parameters: processedParams,
      userId,
      metadata: {
        phase: 'query_no_results',
        processingTime: Date.now() - (queryId ? parseInt(queryId.split('_')[1]) : Date.now())
      }
    };
  }
}

// 导出类
module.exports = WebHookService;

// 创建并导出单例实例
const webhookService = new WebHookService();
module.exports.instance = webhookService;