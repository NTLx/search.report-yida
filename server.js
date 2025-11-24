const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

// 首先加载环境变量
dotenv.config();

// 调试环境变量加载
console.log('环境变量加载检查:');
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET ? '***已设置***' : '未设置');
console.log('APP_TYPE:', process.env.APP_TYPE);
console.log('FORM_UUID:', process.env.FORM_UUID);
console.log('SYSTEM_TOKEN:', process.env.SYSTEM_TOKEN ? '***已设置***' : '未设置');
console.log('NAME_FIELD_ID:', process.env.NAME_FIELD_ID);
console.log('PHONE_FIELD_ID:', process.env.PHONE_FIELD_ID);
console.log('ATTACHMENT_FIELD_ID:', process.env.ATTACHMENT_FIELD_ID);
console.log('WEBHOOK_URL:', process.env.WEBHOOK_URL || '未设置');
console.log('TIMEOUT:', process.env.TIMEOUT || '86400000 (默认)');
console.log('PORT:', process.env.PORT || '8080 (默认)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'production (默认)');

// 然后导入服务模块
const { getAccessToken, queryReportData, getAttachmentUrl } = require('./services/yidaService');
const webhookService = require('./services/webhookService').instance;

// 创建Express应用
const app = express();
const port = process.env.PORT || 8080;

// 配置请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 配置CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 配置请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API路由 - 查询报告
app.post('/api/query-reports', async (req, res) => {
  // 生成查询ID
  const queryId = webhookService.generateQueryId();
  let queryStartTime = Date.now();
  
  try {
    const { name, phone, fromDate, toDate, pageSize = 100, currentPage = 1 } = req.body;
    
    // 输入验证
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: '姓名和手机号为必填项' });
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }
    
    // 构建查询参数
    const queryParams = {
      searchType: 'nameAndPhone', // 新的搜索类型，表示同时使用姓名和手机号
      searchValue: {
        name: name,
        phone: phone
      },
      fromDate: fromDate || (Date.now() - 30 * 24 * 60 * 60 * 1000), // 默认30天前
      toDate: toDate || Date.now(), // 默认当前时间
      pageSize,
      currentPage
    };
    
    console.log(`查询请求: 姓名=${name}, 手机号=${phone}, 查询ID=${queryId}`);
    
    // 发送查询开始事件的WebHook通知（异步，不阻塞主流程）
    const startEvent = webhookService.createQueryStartEvent(queryParams);
    webhookService.sendNotification({
      ...startEvent,
      queryId,
      timestamp: queryStartTime
    }).catch(error => {
      // 只记录错误，不影响主流程
      console.error('发送查询开始WebHook通知失败:', error.message);
    });
    
    // 查询报告数据 - 使用新的多步骤流程
    const response = await queryReportData(queryParams);
    
    if (!response.success) {
      // 查询失败，发送错误事件的WebHook通知
      const errorEvent = webhookService.createQueryCompleteEvent(
        queryParams,
        { error: response.error },
        'error',
        queryId
      );
      webhookService.sendNotification(errorEvent).catch(error => {
        console.error('发送查询错误WebHook通知失败:', error.message);
      });
      
      throw new Error(response.error || '查询报告数据失败');
    }
    
    if (!response.data || response.data.length === 0) {
      console.log('未找到匹配的报告数据');
      
      // 发送查询完成（无结果）事件的WebHook通知
      const noResultEvent = webhookService.createQueryCompleteEvent(
        queryParams,
        { totalCount: 0, resultCount: 0, message: '未找到相关报告' },
        'success',
        queryId
      );
      webhookService.sendNotification(noResultEvent).catch(error => {
        console.error('发送查询完成（无结果）WebHook通知失败:', error.message);
      });
      
      return res.json({ 
        success: true, 
        data: [], 
        totalCount: 0,
        message: '未找到相关报告' 
      });
    }
    
    console.log(`查询完成，处理 ${response.data.length} 个报告数据`);
    
    // 构建响应数据，包含文件名称、下载链接和创建时间
    const reportsWithUrls = response.data.map(report => {
      // 转换数据格式以匹配前端期望的格式
      return {
        fileName: report.fileName,
        downloadUrl: report.downloadUrl || null,
        createTime: report.createTime || report.gmtCreate || '',
        formInstanceId: report.formInstanceId,
        error: report.error || null
      };
    });
    
    // 统计有效报告数量
    const validReports = reportsWithUrls.filter(report => report.downloadUrl);
    const errorReports = reportsWithUrls.filter(report => report.error);
    
    console.log(`查询完成: ${validReports.length} 个有效报告${errorReports.length > 0 ? `, ${errorReports.length} 个有错误` : ''}`);
    
    // 构建结果摘要
    const resultSummary = {
      totalCount: response.totalCount,
      resultCount: reportsWithUrls.length,
      validCount: validReports.length,
      errorCount: errorReports.length,
      processingTime: Date.now() - queryStartTime
    };
    
    // 发送查询完成事件的WebHook通知
    const completeEvent = webhookService.createQueryCompleteEvent(
      queryParams,
      resultSummary,
      errorReports.length > 0 ? 'partial' : 'success',
      queryId
    );
    webhookService.sendNotification(completeEvent).catch(error => {
      console.error('发送查询完成WebHook通知失败:', error.message);
    });
    
    // 返回分页信息和报告数据
    res.json({
      success: true,
      data: reportsWithUrls,
      pagination: {
        currentPage: response.currentPage,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / response.pageSize)
      },
      summary: {
        total: reportsWithUrls.length,
        valid: validReports.length,
        errors: errorReports.length
      },
      message: `找到 ${response.totalCount} 份报告，当前页显示 ${reportsWithUrls.length} 份，其中 ${validReports.length} 份可下载`
    });
  } catch (error) {
    console.error('查询报告时出错:', error);
    
    // 发送查询失败事件的WebHook通知
    const failureEvent = webhookService.createQueryCompleteEvent(
      req.body,
      { error: error.message },
      'error',
      queryId
    );
    webhookService.sendNotification(failureEvent).catch(webhookError => {
      console.error('发送查询失败WebHook通知失败:', webhookError.message);
    });
    
    res.status(500).json({
      success: false,
      message: '服务器内部错误，请稍后再试',
      error: error.message
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 导出应用实例（用于测试）
module.exports = app;

// 只在直接运行此文件时启动服务器
if (require.main === module) {
  // 启动服务器
  const startTime = new Date();
  app.listen(port, () => {
    console.log('='.repeat(50));
    console.log('Report-YiDa 报告查询服务已启动');
    console.log('='.repeat(50));
    console.log(`服务器地址: http://localhost:${port}`);
    console.log(`健康检查: http://localhost:${port}/health`);
    console.log(`API端点: http://localhost:${port}/api/query-reports`);
    console.log(`启动时间: ${startTime.toLocaleString()}`);
    console.log(`运行环境: ${process.env.NODE_ENV || 'production'}`);
    console.log('='.repeat(50));
  });
}