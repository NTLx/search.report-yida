# 常见问题 (FAQ)

## 安装与部署

### Q: 如何安装依赖时遇到权限错误？

**A:** 这通常是由于npm权限问题导致的。您可以尝试以下解决方案：

1. 使用npx（推荐）：
   ```bash
   npx npm install
   ```

2. 更改npm默认目录：
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   source ~/.profile
   ```

3. 使用yarn替代npm：
   ```bash
   npm install -g yarn
   yarn install
   ```

### Q: Docker部署时容器启动失败？

**A:** 请检查以下几点：

1. 确保环境变量已正确配置：
   ```bash
   docker-compose config
   ```

2. 检查端口是否被占用：
   ```bash
   netstat -tulpn | grep 8080
   ```

3. 查看容器日志：
   ```bash
   docker logs report-yida
   ```

### Q: 如何更新到最新版本？

**A:** 更新步骤如下：

1. 拉取最新代码：
   ```bash
   git pull origin main
   ```

2. 重新构建镜像（Docker部署）：
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. 重新安装依赖（直接部署）：
   ```bash
   npm install
   npm start
   ```

## 配置问题

### Q: 如何获取宜搭的表单UUID和字段ID？

**A:** 请按照以下步骤操作：

1. 登录宜搭平台
2. 进入您的应用
3. 打开存放报告的表单页面
4. 在浏览器开发者工具中查看网络请求
5. 查找包含表单信息的API请求
6. 从请求参数中提取表单UUID和字段ID

或者联系您的宜搭管理员获取这些信息。

### Q: 环境变量配置正确但仍无法连接宜搭？

**A:** 请检查以下几点：

1. 确认CLIENT_ID和CLIENT_SECRET是否正确
2. 检查USERID是否有权限访问表单
3. 确认SYSTEM_TOKEN是否有效
4. 检查网络连接是否正常
5. 查看服务器日志获取详细错误信息

### Q: 如何配置HTTPS？

**A:** 您可以通过以下几种方式配置HTTPS：

1. 使用反向代理（如Nginx）：
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

2. 使用Let's Encrypt证书：
   ```bash
   sudo apt install certbot
   sudo certbot --nginx -d yourdomain.com
   ```

3. 在Node.js中直接配置（不推荐生产环境使用）：
   ```javascript
   const fs = require('fs');
   const https = require('https');
   
   const options = {
     key: fs.readFileSync('path/to/private.key'),
     cert: fs.readFileSync('path/to/certificate.crt')
   };
   
   https.createServer(options, app).listen(443);
   ```

## 使用问题

### Q: 查询报告时返回"未找到相关报告"？

**A:** 可能的原因和解决方案：

1. **姓名或手机号输入错误**：请确保输入的姓名和手机号与表单中存储的完全一致
2. **字段ID配置错误**：检查`.env`文件中的`NAME_FIELD_ID`和`PHONE_FIELD_ID`是否正确
3. **权限问题**：确认USERID有权限访问表单数据
4. **时间范围问题**：尝试扩大查询时间范围

### Q: 报告下载链接失效？

**A:** 宜搭的附件下载链接有时效性。请检查：

1. **链接是否过期**：默认链接有效期为24小时（可配置TIMEOUT环境变量）
2. **重新查询**：尝试重新查询获取新的下载链接
3. **缓存问题**：清除浏览器缓存后重试

### Q: 页面加载缓慢或无响应？

**A:** 可能的原因和解决方案：

1. **网络问题**：检查服务器与宜搭API之间的网络连接
2. **API限流**：宜搭API可能有调用频率限制，请适当降低请求频率
3. **服务器资源不足**：检查服务器CPU和内存使用情况
4. **缓存问题**：尝试重启服务清除缓存

## 开发问题

### Q: 如何添加新的查询字段？

**A:** 按照以下步骤操作：

1. 在`.env`文件中添加新字段的环境变量
2. 修改`services/yidaService.js`中的查询逻辑
3. 更新`public/index.html`中的前端表单
4. 修改`server.js`中的API路由处理逻辑

示例代码：
```javascript
// 在yidaService.js中添加新字段
const EMAIL_FIELD_ID = process.env.EMAIL_FIELD_ID;

// 在查询条件中添加新字段
const searchFieldJson = {
  [NAME_FIELD_ID]: searchValue,
  [PHONE_FIELD_ID]: phoneValue,
  [EMAIL_FIELD_ID]: emailValue  // 新增字段
};
```

### Q: 如何自定义前端样式？

**A:** 您可以通过以下方式自定义样式：

1. 修改`public/styles.css`文件
2. 在`public/index.html`中添加内联样式
3. 使用CSS变量覆盖默认样式

示例：
```css
/* 在styles.css中添加 */
:root {
  --primary-color: #your-color;
  --background-color: #your-bg-color;
}

.custom-button {
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
}
```

### Q: 如何添加单元测试？

**A:** 按照以下步骤添加测试：

1. 安装测试框架：
   ```bash
   npm install --save-dev jest supertest
   ```

2. 创建测试文件：
   ```javascript
   // tests/api.test.js
   const request = require('supertest');
   const app = require('../server');
   
   describe('API Endpoints', () => {
     test('POST /api/query-reports', async () => {
       const response = await request(app)
         .post('/api/query-reports')
         .send({
           name: '测试用户',
           phone: '13800138000'
         });
       
       expect(response.statusCode).toBe(200);
     });
   });
   ```

3. 在`package.json`中添加测试脚本：
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

## 其他问题

### Q: 如何备份数据？

**A:** 本系统主要查询宜搭中的数据，不存储数据本身。但您可以备份：

1. 配置文件：
   ```bash
   cp .env .env.backup
   ```

2. 日志文件（如果有）：
   ```bash
   tar -czf logs-$(date +%Y%m%d).tar.gz logs/
   ```

3. Docker数据卷（如果使用）：
   ```bash
   docker run --rm -v report-yida_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
   ```

### Q: 如何监控系统性能？

**A:** 您可以使用以下工具：

1. **PM2**（进程管理）：
   ```bash
   npm install -g pm2
   pm2 start server.js --name report-yida
   pm2 monit
   ```

2. **日志监控**：
   ```javascript
   // 在server.js中添加
   const morgan = require('morgan');
   app.use(morgan('combined'));
   ```

3. **健康检查端点**：
   ```javascript
   // 已内置 /health 端点
   // 可以添加更详细的监控信息
   app.get('/health/detailed', (req, res) => {
     res.json({
       status: 'ok',
       uptime: process.uptime(),
       memory: process.memoryUsage(),
       timestamp: new Date().toISOString()
     });
   });
   ```

---

如果您的问题未在此FAQ中找到答案，请[创建新的Issue](https://github.com/NTLx/search.report-yida/issues/new)联系我们。