# 常见问题 (FAQ)

## 安装与部署

### Q: 系统运行环境要求是什么？

**A:** 本系统需要以下环境：

1. **Node.js**: 版本 20.6.0 或更高（推荐使用 v20 LTS 或 v22 LTS）
2. **npm**: 版本 7.x 或更高
3. **操作系统**: Linux、macOS 或 Windows
4. **内存**: 至少 512MB 可用内存
5. **网络**: 能够访问钉钉和宜搭API的网络环境

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

### Q: 如何使用Docker部署？

**A:** 本项目支持Docker部署，有两种方式：

1. **使用预构建镜像**（推荐）：
   ```bash
   # 克隆项目
   git clone https://github.com/NTLx/search.report-yida.git
   cd search.report-yida
   
   # 复制环境变量模板并配置
   cp .env.example .env
   # 编辑.env文件，填入正确的配置
   
   # 使用docker-compose启动
   docker-compose up -d
   ```

2. **本地构建镜像**：
   ```bash
   # 修改docker-compose.yml，注释掉image行，取消build行的注释
   # build: .
   
   # 构建并启动
   docker-compose up -d --build
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

4. 确认Docker和docker-compose版本兼容性：
   ```bash
   docker --version
   docker-compose --version
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
   docker-compose pull  # 拉取最新镜像
   docker-compose up -d
   ```

3. 重新安装依赖（直接部署）：
   ```bash
   npm install
   npm start
   ```

### Q: 如何配置反向代理？

**A:** 您可以使用Nginx作为反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

对于HTTPS配置，请参考下面的"如何配置HTTPS"问题。

## 配置问题

### Q: 如何正确配置环境变量？

**A:** 请按照以下步骤配置环境变量：

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑`.env`文件，配置以下必要变量：
   ```bash
   # 用户身份相关参数
   USERID=您的钉钉用户ID
   
   # 获取钉钉企业内部应用的accessToken API相关参数
   CLIENT_ID=您的应用AppKey
   CLIENT_SECRET=您的应用AppSecret
   
   # 宜搭应用相关参数
   APP_TYPE=应用类型（通常是PAGE）
   SYSTEM_TOKEN=系统Token
   FORM_UUID=表单UUID
   # 查询字段ID配置（需要根据实际表单配置）
   NAME_FIELD_ID=姓名字段ID
   PHONE_FIELD_ID=手机号字段ID
   ATTACHMENT_FIELD_ID=附件字段ID
   ```

3. 可选配置：
   ```bash
   # 获取宜搭附件临时免登地址 API相关参数
   TIMEOUT=86400000  # 附件链接有效期（毫秒），默认24小时
   
   # WebHook配置（可选）
   WEBHOOK_URL=https://example.com/webhook  # 查询事件通知URL
   
   # 服务器配置
   NODE_ENV=production  # 环境模式
   PORT=8080  # 服务器端口
   ```

### Q: 如何获取宜搭的表单UUID和字段ID？

**A:** 请按照以下步骤操作：

1. **获取表单UUID**：
   - 登录宜搭平台
   - 进入您的应用
   - 打开存放报告的表单页面
   - 查看浏览器地址栏，URL中的`formUuid`参数即为表单UUID
   - 或者在表单设置页面的"表单属性"中查找

2. **获取字段ID**：
   - 在表单编辑页面，点击需要获取ID的字段
   - 在右侧属性面板中查找"字段ID"或"数据标识"
   - 或者在浏览器开发者工具中查看网络请求，从请求参数中提取

3. **验证配置**：
   ```javascript
   // 在浏览器控制台中运行以下代码验证
   fetch('/api/query-reports', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: '测试', phone: '测试' })
   }).then(res => res.json()).then(console.log)
   ```

### Q: 环境变量配置正确但仍无法连接宜搭？

**A:** 请检查以下几点：

1. **确认应用权限**：
   - 确认您的钉钉应用有权限访问宜搭API
   - 检查应用是否已发布到对应的钉钉组织

2. **验证凭证有效性**：
   - 确认CLIENT_ID和CLIENT_SECRET是否正确
   - 检查应用是否已激活且未过期
   - 尝试在钉钉开发者后台重新生成AppSecret

3. **检查用户权限**：
   - 确认USERID有权限访问目标表单
   - 检查表单是否已发布且可访问

4. **验证系统Token**：
   - 确认SYSTEM_TOKEN是否有效
   - 检查表单是否允许API访问

5. **网络连接问题**：
   - 确认服务器可以访问钉钉API（api.dingtalk.com）
   - 检查防火墙设置是否阻止了API请求

6. **查看详细日志**：
   ```bash
   # 查看服务器日志
   docker logs report-yida -f
   # 或直接运行时查看控制台输出
   npm start
   ```

### Q: 如何配置HTTPS？

**A:** 您可以通过以下几种方式配置HTTPS：

1. **使用反向代理（推荐）**：
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
       ssl_prefer_server_ciphers off;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   
   # HTTP重定向到HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

2. **使用Let's Encrypt证书**：
   ```bash
   # 安装certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取证书
   sudo certbot --nginx -d yourdomain.com
   
   # 自动续期
   sudo crontab -e
   # 添加以下行：
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

3. **在Node.js中直接配置**（不推荐生产环境使用）：
   ```javascript
   const fs = require('fs');
   const https = require('https');
   
   const options = {
     key: fs.readFileSync('path/to/private.key'),
     cert: fs.readFileSync('path/to/certificate.crt')
   };
   
   https.createServer(options, app).listen(443);
   ```

### Q: 如何配置WebHook通知？

**A:** WebHook功能可以在查询事件触发时发送通知，配置方法如下：

1. **设置环境变量**：
   ```bash
   WEBHOOK_URL=https://your-domain.com/webhook-endpoint
   ```

2. **WebHook请求格式**：
   ```json
   {
     "event": "query_executed",
     "timestamp": "2023-01-01T12:00:00Z",
     "data": {
       "query": {
         "name": "查询的姓名",
         "phone": "查询的手机号"
       },
       "result": {
         "count": 2,
         "reports": [
           {
             "name": "报告名称",
             "date": "2023-01-01",
             "downloadUrl": "https://..."
           }
         ]
       }
     }
   }
   ```

3. **创建WebHook接收端点示例**：
   ```javascript
   // Express.js示例
   app.post('/webhook-endpoint', express.json(), (req, res) => {
     console.log('收到查询通知:', req.body);
     // 处理通知逻辑
     
     res.status(200).send('OK');
   });
   ```

## 使用问题

### Q: 查询报告时返回"未找到相关报告"？

**A:** 可能的原因和解决方案：

1. **输入信息不匹配**：
   - 确保输入的姓名和手机号与表单中存储的完全一致
   - 检查是否有空格、特殊字符或大小写差异
   - 尝试使用部分姓名或手机号后几位进行查询

2. **字段ID配置错误**：
   - 检查`.env`文件中的`NAME_FIELD_ID`和`PHONE_FIELD_ID`是否正确
   - 确认字段ID与宜搭表单中的实际字段ID匹配
   - 参考上面的"如何获取宜搭的表单UUID和字段ID"问题

3. **权限问题**：
   - 确认USERID有权限访问表单数据
   - 检查表单是否已发布且可访问
   - 验证SYSTEM_TOKEN是否有效

4. **数据同步延迟**：
   - 宜搭数据可能存在同步延迟，稍后重试
   - 检查表单数据是否已成功提交并保存

5. **调试方法**：
   ```javascript
   // 在浏览器控制台中查看详细错误信息
   fetch('/api/query-reports', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: '您的姓名', phone: '您的手机号' })
   }).then(res => res.json()).then(console.log)
   ```

### Q: 报告下载链接失效或无法下载？

**A:** 宜搭的附件下载链接有时效性，请检查：

1. **链接是否过期**：
   - 默认链接有效期为24小时（可配置TIMEOUT环境变量）
   - 过期后需要重新查询获取新的下载链接

2. **浏览器下载问题**：
   - 检查浏览器是否阻止了下载
   - 尝试右键链接选择"另存为"
   - 清除浏览器缓存后重试

3. **文件访问权限**：
   - 确认您的账号有权限访问该附件
   - 检查附件是否已被删除或移动

4. **网络问题**：
   - 检查网络连接是否稳定
   - 尝试使用其他网络环境下载

5. **文件格式问题**：
   - 某些文件格式可能需要特定软件打开
   - 检查文件是否完整下载（查看文件大小）

### Q: 页面加载缓慢或无响应？

**A:** 可能的原因和解决方案：

1. **网络连接问题**：
   - 检查服务器与宜搭API之间的网络连接
   - 尝试使用网络诊断工具测试连接
   - 考虑使用CDN加速静态资源

2. **API限流**：
   - 宜搭API可能有调用频率限制
   - 系统已内置请求限流保护，但可能仍需降低查询频率
   - 考虑增加缓存时间减少API调用

3. **服务器资源不足**：
   - 检查服务器CPU和内存使用情况
   - 监控服务器负载和响应时间
   - 考虑升级服务器配置或使用负载均衡

4. **前端性能问题**：
   - 清除浏览器缓存
   - 禁用浏览器插件
   - 尝试使用其他浏览器或无痕模式

5. **数据库查询优化**：
   - 检查查询条件是否合理
   - 考虑添加索引优化查询速度
   - 限制单次查询返回的数据量

### Q: 移动端使用体验不佳？

**A:** 本系统已针对移动端进行了优化，但可能仍有以下问题：

1. **触摸操作问题**：
   - 确保使用最新版本的移动浏览器
   - 尝试刷新页面重新加载
   - 检查是否有JavaScript错误

2. **界面显示问题**：
   - 确保手机屏幕分辨率支持
   - 尝试横屏模式
   - 调整浏览器缩放比例

3. **输入法问题**：
   - 某些输入法可能与表单有兼容性问题
   - 尝试使用系统默认输入法
   - 检查输入框是否获得焦点

4. **下载功能问题**：
   - 移动端下载可能需要额外权限
   - 检查浏览器下载设置
   - 尝试使用其他下载方式

### Q: 如何切换深色/浅色模式？

**A:** 系统支持手动切换主题：
1. 在页面右上角找到圆形的"月亮"（或"太阳"）图标按钮。
2. 点击该按钮即可在深色和浅色模式之间切换。
3. 系统默认会跟随您的操作系统主题设置。

### Q: 哪里可以找到项目源代码？

**A:** 您可以通过点击页面左上角的 GitHub 图标按钮，直接跳转到本项目的 GitHub 仓库查看源代码。

### Q: 如何批量查询多个报告？

**A:** 当前系统主要支持单个查询，但可以通过以下方式实现批量查询：

1. **多次单独查询**：
   - 依次输入不同的姓名和手机号进行查询
   - 适合少量报告的查询

2. **API批量调用**：
   ```javascript
   // 示例：批量查询多个报告
   const queries = [
     { name: '姓名1', phone: '手机号1' },
     { name: '姓名2', phone: '手机号2' }
   ];
   
   Promise.all(queries.map(query => 
     fetch('/api/query-reports', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(query)
     }).then(res => res.json())
   )).then(results => {
     console.log('批量查询结果:', results);
   });
   ```

3. **自定义开发**：
   - 可以基于现有API开发批量查询功能
   - 参考API文档了解接口详情
   - 注意API调用频率限制

### Q: 如何导出查询结果？

**A:** 当前系统提供以下导出方式：

1. **单个下载**：
   - 点击查询结果中的下载链接
   - 适合少量报告的下载

2. **浏览器打印**：
   - 使用浏览器的打印功能
   - 可以选择"保存为PDF"
   - 适合创建查询记录

3. **自定义开发**：
   ```javascript
   // 示例：将查询结果导出为CSV
   function exportToCSV(data) {
     const csv = [
       ['报告名称', '创建日期', '下载链接'],
       ...data.map(item => [
         item.name,
         item.date,
         item.downloadUrl
       ])
     ].map(row => row.join(',')).join('\n');
     
     const blob = new Blob([csv], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'reports.csv';
     a.click();
   }
   ```

## 开发问题

### Q: 如何添加新的查询字段？

**A:** 要添加新的查询字段，需要修改以下部分：

1. **前端界面修改**：
   ```javascript
   // 在public/index.html中添加新的输入字段
   <div class="form-group">
     <label for="newField">新字段</label>
     <input type="text" id="newField" name="newField" required>
   </div>
   ```

2. **后端API修改**：
   ```javascript
   // 在services/yidaService.js中修改查询条件
   const searchConditions = {
     [process.env.NAME_FIELD_ID]: name,
     [process.env.PHONE_FIELD_ID]: phone,
     [process.env.NEW_FIELD_ID]: newField  // 添加新字段
   };
   ```

3. **环境变量配置**：
   ```bash
   # 在.env文件中添加新字段ID
   NEW_FIELD_ID=field_xxxxxxxxxxxx
   ```

4. **测试验证**：
   - 使用新字段进行查询测试
   - 确保查询逻辑正确
   - 更新相关文档

### Q: 如何自定义前端样式？

**A:** 前端样式主要通过CSS控制，可以通过以下方式自定义：

1. **修改现有样式**：
   ```css
   /* 在public/index.html的<style>标签中修改 */
   .container {
     max-width: 1200px;  /* 修改容器宽度 */
     background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);  /* 修改背景 */
   }
   ```

2. **添加自定义CSS**：
   ```html
   <!-- 在public/index.html的<head>中添加外部CSS文件使用短横线命名法 (e.g., `styles.css`) -->
   <link rel="stylesheet" href="/css/styles.css">
   ```

3. **响应式设计调整**：
   ```css
   /* 针对不同屏幕尺寸调整样式 */
   @media (max-width: 768px) {
     .form-group {
       margin-bottom: 15px;
     }
   }
   ```

4. **主题色彩定制**：
   ```css
   :root {
     --primary-color: #4285f4;  /* 修改主色调 */
     --secondary-color: #34a853;  /* 修改辅助色 */
     --accent-color: #fbbc05;  /* 修改强调色 */
   }
   ```

### Q: 如何添加单元测试？

**A:** 可以使用以下框架添加单元测试：

1. **安装测试框架**：
   ```bash
   npm install --save-dev jest supertest
   ```

2. **创建测试文件**：
   ```javascript
   // tests/api.test.js
   const request = require('supertest');
   const app = require('../app');
   
   describe('API Endpoints', () => {
     test('POST /api/query-reports', async () => {
       const response = await request(app)
         .post('/api/query-reports')
         .send({ name: '测试姓名', phone: '13800138000' });
       
       expect(response.statusCode).toBe(200);
       expect(response.body).toHaveProperty('success');
     });
   });
   ```

3. **配置package.json**：
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

4. **运行测试**：
   ```bash
   npm test
   ```

### Q: 如何集成Mermaid图表？

**A:** 本项目已在README.md中使用Mermaid图表，如需在其他地方使用：

1. **HTML中引入Mermaid**：
   ```html
   <!-- 在HTML头部添加Mermaid库 -->
   <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
   ```

2. **初始化Mermaid**：
   ```javascript
   // 在JavaScript中初始化Mermaid
   mermaid.initialize({
     startOnLoad: true,
     theme: 'default',
     flowchart: {
       useMaxWidth: true,
       htmlLabels: true
     }
   });
   ```

3. **创建图表容器**：
   ```html
   <!-- 在HTML中添加图表容器 -->
   <div class="mermaid">
     graph TD
       A[开始] --> B{判断条件}
       B -->|是| C[执行操作]
       B -->|否| D[结束]
       C --> D
   </div>
   ```

4. **动态生成图表**：
   ```javascript
   // 动态创建和渲染Mermaid图表
   function createChart(id, definition) {
     const element = document.createElement('div');
     element.className = 'mermaid';
     element.textContent = definition;
     document.getElementById(id).appendChild(element);
     mermaid.init(undefined, element);
   }
   ```

### Q: Mermaid图表不显示或显示错误？

**A:** 可能的原因和解决方案：

1. **CDN加载问题**：
   ```html
   <!-- 使用稳定的CDN源 -->
   <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
   <!-- 或使用本地文件 -->
   <script src="/js/mermaid.min.js"></script>
   ```

2. **语法错误**：
   ```javascript
   // 验证Mermaid语法
   mermaid.parse('graph TD\nA-->B');  // 返回true表示语法正确
   
   // 查看详细错误信息
   try {
     mermaid.parse('graph TD\nA-');
   } catch (error) {
     console.error('Mermaid语法错误:', error);
   }
   ```

3. **初始化时机问题**：
   ```javascript
   // 确保在DOM加载完成后初始化
   document.addEventListener('DOMContentLoaded', function() {
     mermaid.initialize({
       startOnLoad: true,
       theme: 'default'
     });
   });
   
   // 或手动渲染特定元素
   mermaid.init(undefined, document.querySelectorAll('.mermaid'));
   ```

4. **主题和样式冲突**：
   ```javascript
   // 指定主题避免冲突
   mermaid.initialize({
     theme: 'base',
     themeVariables: {
       primaryColor: '#f3f9ff',
       primaryTextColor: '#0d47a1',
       primaryBorderColor: '#2196f3',
       lineColor: '#42a5f5',
       sectionBkgColor: '#e3f2fd',
       altSectionBkgColor: '#bbdefb'
     }
   });
   ```

5. **动态内容更新**：
   ```javascript
   // 更新图表内容
   function updateChart(containerId, newDefinition) {
     const container = document.getElementById(containerId);
     container.innerHTML = `<div class="mermaid">${newDefinition}</div>`;
     mermaid.init(undefined, container.querySelector('.mermaid'));
   }
   ```

### Q: 如何在Markdown中正确使用Mermaid？

**A:** 在Markdown文档中使用Mermaid的注意事项：

1. **基本语法**：
   ```markdown
   ```mermaid
   graph TD
     A[开始] --> B{条件判断}
     B -->|是| C[执行A]
     B -->|否| D[执行B]
     C --> E[结束]
     D --> E
   ```
   ```

2. **避免代码块冲突**：
   ```markdown
   <!-- 确保Mermaid代码块前后没有其他代码块 -->
   正确示例：
   文本内容
   
   ```mermaid
   graph TD
     A --> B
   ```
   
   更多文本内容
   ```

3. **复杂图表缩进**：
   ```markdown
   ```mermaid
   graph TB
     subgraph 子图1
       A1[节点1] --> A2[节点2]
     end
     
     subgraph 子图2
       B1[节点1] --> B2[节点2]
     end
     
     A2 --> B1
   ```
   ```

4. **特殊字符处理**：
   ```markdown
   ```mermaid
   graph TD
     A["包含特殊字符的节点(如括号)"] --> B
     B --> C["使用引号包裹特殊字符"]
   ```
   ```

5. **GitHub兼容性**：
   ```markdown
   <!-- GitHub原生支持Mermaid，但某些平台可能需要扩展 -->
   <!-- 确保平台支持Mermaid渲染 -->
   <!-- 可以添加HTML注释说明 -->
   <!-- Mermaid图表开始 -->
   ```mermaid
   sequenceDiagram
     participant A as 用户
     participant B as 系统
     A->>B: 发送请求
     B-->>A: 返回结果
   ```
   <!-- Mermaid图表结束 -->
   ```

### Q: 如何调试Mermaid图表渲染问题？

**A:** 调试Mermaid图表的常用方法：

1. **浏览器控制台检查**：
   ```javascript
   // 检查Mermaid是否正确加载
   console.log(typeof mermaid);  // 应该输出'object'
   
   // 检查Mermaid版本
   console.log(mermaid.version);  // 输出版本号
   
   // 检查图表定义语法
   const graphDefinition = 'graph TD\nA-->B';
   console.log(mermaid.parse(graphDefinition));  // true表示语法正确
   ```

2. **查看渲染结果**：
   ```javascript
   // 获取渲染后的SVG元素
   const svgElement = document.querySelector('.mermaid svg');
   console.log(svgElement);  // 查看SVG内容
   
   // 检查是否有错误信息
   const errorElement = document.querySelector('.mermaid .error');
   if (errorElement) {
     console.error('Mermaid渲染错误:', errorElement.textContent);
   }
   ```

3. **使用Mermaid在线编辑器**：
   - 访问 https://mermaid.live/
   - 粘贴图表代码验证语法
   - 调整样式和布局
   - 导出正确的代码

4. **分步调试**：
   ```javascript
   // 分步创建和渲染图表
   async function debugMermaid() {
     try {
       // 1. 初始化Mermaid
       mermaid.initialize({ startOnLoad: false });
       
       // 2. 验证语法
       const definition = 'graph TD\nA-->B';
       const isValid = mermaid.parse(definition);
       console.log('语法验证:', isValid);
       
       // 3. 渲染图表
       const { svg } = await mermaid.render('mermaid-chart', definition);
       console.log('渲染结果:', svg);
       
       // 4. 插入到DOM
       document.getElementById('chart-container').innerHTML = svg;
     } catch (error) {
       console.error('Mermaid调试错误:', error);
     }
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
   pm2 start app.js --name report-yida
   pm2 monit
   ```

2. **日志监控**：
   ```javascript
   // 在app.js中添加
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