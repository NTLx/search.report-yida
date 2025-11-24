# 报告查询系统 (Report-YiDa)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub stars](https://img.shields.io/github/stars/NTLx/search.report-yida.svg?style=social&label=Star)](https://github.com/NTLx/search.report-yida)
[![GitHub forks](https://img.shields.io/github/forks/NTLx/search.report-yida.svg?style=social&label=Fork)](https://github.com/NTLx/search.report-yida/network)
[![GitHub issues](https://img.shields.io/github/issues/NTLx/search.report-yida.svg)](https://github.com/NTLx/search.report-yida/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/NTLx/search.report-yida.svg)](https://github.com/NTLx/search.report-yida/commits/main)
[![GitHub release](https://img.shields.io/github/release/NTLx/search.report-yida.svg)](https://github.com/NTLx/search.report-yida/releases)
[![Platform](https://img.shields.io/badge/platform-Node.js-lightgrey)](https://nodejs.org/)
[![API](https://img.shields.io/badge/API-REST-green)](https://restfulapi.net/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/NTLx/search.report-yida/actions)
[![Code Style](https://img.shields.io/badge/code%20style-airbnb-blue)](https://github.com/airbnb/javascript)

一个基于宜搭API的报告查询系统，允许外部用户通过姓名和手机号免登录查询并下载报告。

## 🌟 主要特性

- **免登录查询** - 外部用户无需登录即可查询报告
- **安全验证** - 通过姓名和手机号双重验证确保数据安全
- **灵活配置** - 支持通过环境变量对接不同宜搭实例
- **响应式设计** - 适配各种设备屏幕尺寸
- **缓存优化** - 内置缓存机制减少API调用次数
- **容器化部署** - 支持Docker和Docker Compose部署
- **API限流** - 防止恶意请求保护系统稳定性
- **WebHook通知** - 实时查询事件通知，便于系统集成和监控

## 🚀 快速开始

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 或 yarn
- 有效的宜搭应用凭证

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/NTLx/search.report-yida.git
cd search.report-yida
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的宜搭应用凭证
```

4. 启动服务
```bash
npm start
```

服务将在 http://localhost:8080 上运行。

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

1. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的宜搭应用凭证
```

2. 启动服务
```bash
docker-compose up -d
```

### 使用 Docker

1. 构建镜像
```bash
docker build -t report-yida .
```

2. 运行容器
```bash
docker run -d -p 8080:8080 --env-file .env --name report-yida report-yida
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `USERID` | 是 | 用户ID |
| `CLIENT_ID` | 是 | 钉钉企业内部应用的 AppKey |
| `CLIENT_SECRET` | 是 | 钉钉企业内部应用的 AppSecret |
| `APP_TYPE` | 是 | 宜搭应用类型 |
| `SYSTEM_TOKEN` | 是 | 宜搭系统令牌 |
| `FORM_UUID` | 是 | 存放报告的表单 UUID |
| `TIMEOUT` | 否 | 附件链接超时时间（默认 86400000 毫秒） |
| `NAME_FIELD_ID` | 是 | 姓名字段 ID |
| `PHONE_FIELD_ID` | 是 | 手机号字段 ID |
| `ATTACHMENT_FIELD_ID` | 是 | 附件字段 ID |
| `PORT` | 否 | 服务端口（默认 8080） |
| `NODE_ENV` | 否 | 运行环境（默认 production） |
| `WEBHOOK_URL` | 否 | WebHook通知URL，留空则不启用 |

### 宜搭表单要求

为确保系统正常工作，存放报告附件的表单必须包含以下三个组件：

1. **姓名** - 文本组件，用于存储用户姓名
2. **手机号** - 文本组件，用于存储用户手机号
3. **附件** - 附件组件，用于存储报告文件

## 📖 API 文档

### WebHook事件通知

系统支持WebHook功能，可在查询事件发生时向指定URL发送实时通知。

#### 配置方法

在`.env`文件中设置`WEBHOOK_URL`环境变量：

```env
WEBHOOK_URL=https://your-webhook-endpoint.com/api/events
```

#### 事件类型

系统会发送以下类型的查询事件：

1. **查询开始** (`query_start`)
2. **查询完成** (`query_complete`)
3. **查询失败** (`query_failed`)
4. **无结果** (`query_no_results`)

#### WebHook数据格式

**查询开始事件示例**:
```json
{
  "metadata": {
    "phase": "query_start"
  },
  "system": {
    "environment": "production",
    "source": "Report-YiDa",
    "version": "1.0.0"
  },
  "messageType": "search",
  "resultSummary": {},
  "parameters": {
    "fromDate": "1704067200000",
    "searchType": "nameAndPhone",
    "phone": "13800138000",
    "toDate": "1735689599999",
    "name": "张三",
    "pageSize": 100,
    "currentPage": 1
  },
  "queryId": "query_1704067200000_a1b2c3d4",
  "timestamp": "1704067200000",
  "status": "started"
}
```

**查询完成事件示例**:
```json
{
  "metadata": {
    "phase": "query_complete",
    "processingTime": 1054
  },
  "system": {
    "environment": "production",
    "source": "Report-YiDa",
    "version": "1.0.0"
  },
  "messageType": "search",
  "resultSummary": {
    "resultCount": 4,
    "totalCount": 2,
    "validCount": 4,
    "errorCount": 0,
    "processingTime": 1054
  },
  "parameters": {
    "fromDate": "1704067200000",
    "searchType": "nameAndPhone",
    "phone": "13800138000",
    "toDate": "1735689599999",
    "name": "张三",
    "pageSize": 100,
    "currentPage": 1
  },
  "queryId": "query_1704067200000_a1b2c3d4",
  "timestamp": "1704067201054",
  "status": "success"
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| metadata | object | 元数据，包含事件阶段和处理时间等信息 |
| metadata.phase | string | 事件阶段，如"query_start"、"query_complete"等 |
| metadata.processingTime | number | 处理时间（毫秒），仅在查询完成事件中存在 |
| system | object | 系统信息 |
| system.environment | string | 运行环境，如"production" |
| system.source | string | 系统来源，固定为"Report-YiDa" |
| system.version | string | 系统版本号 |
| messageType | string | 消息类型，固定为"search" |
| resultSummary | object | 查询结果摘要 |
| resultSummary.resultCount | number | 结果数量 |
| resultSummary.totalCount | number | 总数量 |
| resultSummary.validCount | number | 有效结果数量 |
| resultSummary.errorCount | number | 错误数量 |
| resultSummary.processingTime | number | 处理时间（毫秒） |
| parameters | object | 查询参数 |
| parameters.fromDate | string | 开始日期时间戳 |
| parameters.searchType | string | 搜索类型，如"nameAndPhone" |
| parameters.phone | string | 查询的手机号 |
| parameters.toDate | string | 结束日期时间戳 |
| parameters.name | string | 查询的姓名 |
| parameters.pageSize | number | 每页大小 |
| parameters.currentPage | number | 当前页码 |
| queryId | string | 查询的唯一标识符 |
| timestamp | string | 事件发生的时间戳（毫秒） |
| status | string | 查询状态，如"started"、"success"等 |

#### 安全注意事项

- WebHook URL应使用HTTPS协议
- 建议对接收的WebHook请求进行签名验证
- 避免在WebHook URL中包含敏感信息

### 查询报告

**端点**: `POST /api/query-reports`

**请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "fromDate": "2025-01-01",  // 可选
  "toDate": "2025-12-31",    // 可选
  "pageSize": 100,           // 可选，默认100
  "currentPage": 1           // 可选，默认1
}
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "fileName": "体检报告.pdf",
      "downloadUrl": "https://...",
      "createTime": "2025-11-24T10:30:00Z",
      "formInstanceId": "instance_id",
      "error": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 100,
    "totalCount": 1,
    "totalPages": 1
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "errors": 0
  },
  "message": "找到 1 份报告，当前页显示 1 份，其中 1 份可下载"
}
```

### 健康检查

**端点**: `GET /health`

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

## 🏗️ 项目结构

```
Report-YiDa/
├── app/                   # 应用代码
│   └── api/               # API路由
├── public/                # 前端静态文件
│   ├── index.html         # 主页面
│   ├── styles.css         # 样式文件
│   ├── magic-styles.css   # 魔法样式
│   └── script.js          # 前端脚本
├── services/              # 服务层
│   ├── cacheService.js    # 缓存服务
│   ├── webhookService.js  # WebHook通知服务
│   └── yidaService.js     # 宜搭API服务
├── .env.example           # 环境变量示例
├── docker-compose.yml     # Docker Compose配置
├── Dockerfile             # Docker镜像配置
├── package.json           # 项目依赖
└── server.js              # 服务器入口
```

## 🔧 开发指南

### 本地开发

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件
```

3. 启动开发服务器
```bash
npm start
```

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Airbnb JavaScript 代码规范
- 提交前运行测试确保代码质量

## 🤝 贡献指南

我们欢迎任何形式的贡献！无论是提交问题、功能请求还是直接贡献代码。

1. Fork 本仓库：https://github.com/NTLx/search.report-yida
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

详细的贡献指南请参考 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 更新日志

### v1.0.0 (2025-11-24)

- 初始版本发布
- 实现基本的报告查询功能
- 添加Docker支持
- 实现缓存机制

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到任何问题或有任何疑问，请：

1. 查看我们的 [常见问题 (FAQ)](FAQ.md)
2. 搜索现有的 [Issues](https://github.com/NTLx/search.report-yida/issues)
3. 创建新的 [Issue](https://github.com/NTLx/search.report-yida/issues/new)

## 👨‍💻 项目维护者

本项目由以下人员维护：

- **NTLx** (lx3325360@gmail.com) - 项目创建者和主要维护者

## 🙏 致谢

感谢以下开源项目和平台，为本项目提供了强大的基础支持：

### 核心框架与库
- [Express.js](https://expressjs.com/) - 快速、极简的Web框架
- [Node.js](https://nodejs.org/) - JavaScript运行时环境
- [Axios](https://axios-http.com/) - 基于Promise的HTTP客户端
- [dotenv](https://github.com/motdotla/dotenv) - 环境变量管理工具

### 安全与性能
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit) - Express请求限流中间件

### 平台与服务
- [宜搭](https://www.aliwork.com/) - 阿里云低代码应用开发平台
- [钉钉](https://www.dingtalk.com/) - 企业级智能移动办公平台

### 开发工具
- [Docker](https://www.docker.com/) - 容器化平台
- [Docker Compose](https://docs.docker.com/compose/) - 多容器应用编排工具

### 设计与UI
- 所有使用的前端样式库和框架的贡献者

特别感谢所有为这些开源项目做出贡献的开发者们！

---

**免责声明**: 本项目仅用于学习和研究目的。请确保您有权限访问和使用宜搭API，并遵守相关法律法规和平台使用条款。