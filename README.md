# Report-YiDa

<div align="center">

![Report-YiDa Logo](https://img.shields.io/badge/Report--YiDa-blue?style=for-the-badge)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)

**一个基于Next.js和Express的宜搭报告查询系统，提供简洁高效的报告查询和管理功能。**

[快速开始](#快速开始) • [功能特性](#功能特性) • [部署指南](#部署指南) • [API文档](#api文档) • [贡献指南](#贡献指南)

</div>

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
- [部署指南](#部署指南)
- [API文档](#api文档)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [许可证](#许可证)
- [联系方式](#联系方式)

## 🌟 项目简介

Report-YiDa 是一个专为钉钉宜搭平台设计的报告查询系统，通过简洁的Web界面帮助用户快速查询和管理宜搭表单数据。系统采用前后端分离架构，前端使用Next.js构建现代化用户界面，后端使用Express提供RESTful API服务，并通过钉钉开放平台API实现与宜搭的数据交互。

### 🎯 设计目标

- **简化查询流程**：通过姓名和手机号快速定位报告
- **提升用户体验**：现代化UI设计，响应式布局
- **优化性能**：智能缓存机制，减少API调用
- **便于部署**：提供Docker容器化解决方案

## ✨ 功能特性

- 🔍 **快速查询**: 支持通过姓名和手机号快速查询宜搭表单数据
- 📊 **结果展示**: 清晰展示查询结果，包括附件下载链接
- 🔄 **数据缓存**: 智能缓存钉钉访问令牌，提高响应速度
- 📱 **响应式设计**: 适配各种设备屏幕，提供良好的移动端体验
- 🐳 **Docker支持**: 提供完整的Docker部署方案，简化部署流程
- 🛡️ **类型安全**: 使用TypeScript开发，提供更好的代码可维护性
- 🚀 **高性能**: 采用Next.js App Router，提供更快的页面加载速度
- 🎨 **现代UI**: 基于HeroUI组件库，提供美观一致的用户界面
- 📄 **分页支持**: 大量数据分页展示，提高页面性能
- ⚡ **错误处理**: 完善的错误处理机制，提供友好的错误提示

## 🛠 技术栈

### 前端
- **框架**: Next.js 14.2.33 (App Router)
- **语言**: TypeScript 5.2.2
- **样式**: Tailwind CSS 3.3.5
- **UI组件**: HeroUI (formerly NextUI) 2.2.10
- **图标**: Lucide React 0.294.0
- **动画**: Framer Motion 11.5.6

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js 4.18.2
- **缓存**: 内存缓存 (可扩展至Redis)
- **API交互**: 钉钉开放平台API、宜搭API
- **限流**: express-rate-limit 6.9.0

### 开发工具
- **包管理**: npm
- **代码规范**: ESLint
- **容器化**: Docker & Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker >= 20.0.0 (可选，用于容器化部署)

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/NTLx/search.report-yida.git
cd search.report-yida
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑.env文件，填入必要的配置信息
```

4. **启动开发服务器**
```bash
# 启动后端服务 (端口3001)
npm run server

# 启动前端服务 (端口3000)
npm run dev
```

5. **访问应用**
打开浏览器访问 http://localhost:3000

### Docker 部署

```bash
# 使用docker-compose部署
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## ⚙️ 环境变量配置

在`.env`文件中配置以下变量：

```bash
# 用户身份相关参数
USERID=xxx

# 获取钉钉企业内部应用的accessToken API相关参数
CLIENT_ID=xxx
CLIENT_SECRET=xxx

# 宜搭应用相关参数
APP_TYPE=xxx
SYSTEM_TOKEN=xxx
FORM_UUID=xxx

# 获取宜搭附件临时免登地址 API相关参数
TIMEOUT=86400000

# 查询字段ID配置（需要根据实际表单配置）
NAME_FIELD_ID=xxx
PHONE_FIELD_ID=xxx
ATTACHMENT_FIELD_ID=xxx

# 服务器端口配置
PORT=3001

# 运行环境
NODE_ENV=production
```

### 🔑 获取配置参数

1. **钉钉应用凭证**:
   - 登录[钉钉开放平台](https://open.dingtalk.com/)
   - 创建企业内部应用
   - 获取 `CLIENT_ID` 和 `CLIENT_SECRET`

2. **宜搭应用参数**:
   - 登录[宜搭平台](https://www.dingtalk.com/)
   - 进入应用设置
   - 获取 `APP_TYPE`、`SYSTEM_TOKEN` 和 `FORM_UUID`

3. **字段ID获取**:

获取钉钉宜搭（YiDa）表单字段 ID（也称为**组件 ID** 或 **唯一标识**）推荐在表单设计器中查看（最常用）：
1. 进入编辑模式：打开你的宜搭应用，找到对应的页面或表单，点击"编辑"进入页面设计器
2. 选中组件：在画布中间，鼠标点击你想要获取 ID 的那个输入框或组件
3. 查看右侧面板：在屏幕右侧的"属性"面板中查找"组件 ID"或"唯一标识"字段
4. 复制ID：通常格式为 `textField_xxxxxx`、`dateField_xxxxxx` 等

**重要提示**：
- 自定义字段通常以组件类型开头，如 `textField_l4b12345`（文本）、`selectField_m9c87654`（下拉）
- 组件ID一旦生成，通常无法手动修改为自定义字符串

## 📦 部署指南

### Docker 部署

本项目使用单个Docker容器同时运行前端和后端服务，简化了部署流程。

#### 文件说明

- `Dockerfile`: 用于构建包含前端和后端的完整应用Docker镜像
- `docker-compose.yml`: 部署完整应用的Docker Compose配置

#### 端口配置

- 前端服务 (Next.js): 3000端口
- 后端服务 (Express API): 3001端口

#### 部署方式

```bash
# 使用docker-compose部署
docker-compose up -d

# 或者直接构建并运行
docker build -t search.report-yida .
docker run -d -p 3000:3000 -p 3001:3001 --env-file .env search.report-yida

# 前台运行，查看日志
docker-compose up

# 查看日志
docker-compose logs -f

# 查看运行状态
docker-compose ps
```

#### 访问地址

- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/health

#### 日志管理

Docker Compose配置已限制日志大小：
- 单个日志文件最大: 10MB
- 保留日志文件数量: 3个

#### 注意事项

1. 确保Docker和Docker Compose已正确安装
2. 在生产环境中，建议使用适当的资源限制和安全配置
3. 如果使用Nginx作为反向代理，请相应调整端口配置
4. 定期更新基础镜像以获取安全补丁
5. 容器内同时运行前端和后端服务，确保有足够的内存和CPU资源

### 传统部署

1. **构建前端**
```bash
npm run build
```

2. **启动服务**
```bash
# 生产环境
npm start

# 或者分别启动前后端
npm run server &  # 后端服务
npm run start:next  # 前端服务
```

3. **使用PM2管理进程**
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js
```

## 📚 API文档

### 查询报告

**POST** `/api/query-reports`

#### 请求体

```json
{
  "name": "用户姓名",
  "phone": "手机号码",
  "fromDate": 1672531200000,  // 可选，时间戳
  "toDate": 1675209600000,    // 可选，时间戳
  "pageSize": 100,            // 可选，默认100
  "currentPage": 1            // 可选，默认1
}
```

#### 响应

```json
{
  "success": true,
  "data": [
    {
      "fileName": "报告文件名.pdf",
      "downloadUrl": "附件下载链接",
      "createTime": "2023年01月01日",
      "formInstanceId": "表单实例ID",
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

**GET** `/health`

#### 响应

```json
{
  "status": "ok",
  "timestamp": "2023-11-20T09:01:40.347Z"
}
```

## 📁 项目结构

```
Report-YiDa/
├── app/                    # Next.js应用目录
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 应用布局
│   └── page.tsx           # 主页面
├── components/             # React组件
│   ├── QueryForm.tsx      # 查询表单组件
│   └── ResultsTable.tsx   # 结果表格组件
├── services/              # 服务层
│   ├── cacheService.js    # 缓存服务
│   └── yidaService.js     # 宜搭API服务
├── public/                # 静态资源
├── .env.example           # 环境变量示例
├── docker-compose.yml     # Docker Compose配置
├── Dockerfile             # Docker镜像构建文件
├── next.config.js         # Next.js配置
├── package.json           # 项目依赖和脚本
├── server.js              # Express服务器
└── tailwind.config.js     # Tailwind CSS配置
```

## 👨‍💻 开发指南

### 代码规范

- 代码风格遵循ESLint配置
- 提交信息遵循[Conventional Commits](https://www.conventionalcommits.org/)规范
- 使用TypeScript进行类型检查
- 组件使用函数式组件和Hooks

### 本地开发流程

1. **创建功能分支**
```bash
git checkout -b feature/amazing-feature
```

2. **开发与测试**
```bash
# 启动开发服务器
npm run dev
npm run server

# 运行测试
npm test
```

3. **提交代码**
```bash
git add .
git commit -m "feat: add amazing feature"
```

4. **推送并创建PR**
```bash
git push origin feature/amazing-feature
```

### 项目脚本

```json
{
  "dev": "next dev",           // 启动前端开发服务器
  "build": "next build",       // 构建前端应用
  "start": "node server.js",   // 启动生产环境服务器
  "start:next": "next start",  // 启动Next.js生产服务器
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## ❓ 常见问题

### Q: 如何获取宜搭表单的字段ID？

A: 您可以通过以下方式获取字段ID：
1. 在宜搭设计器中选中字段，查看URL中的参数
2. 通过宜搭API获取表单详情
3. 联系宜搭管理员获取

### Q: 如何配置钉钉应用？

A: 请参考钉钉开放平台文档，创建企业内部应用并获取相应的CLIENT_ID和CLIENT_SECRET。

### Q: 如何扩展缓存功能？

A: 当前使用内存缓存，您可以通过修改`cacheService.js`来集成Redis等外部缓存系统。

### Q: 部署后无法访问附件怎么办？

A: 请检查以下配置：
1. 确认ATTACHMENT_FIELD_ID配置正确
2. 检查钉钉应用权限设置
3. 验证SYSTEM_TOKEN是否有效
4. 查看服务器日志获取详细错误信息

### Q: 如何自定义UI样式？

A: 项目使用Tailwind CSS和HeroUI，您可以通过以下方式自定义：
1. 修改`tailwind.config.js`配置主题
2. 在组件中使用HeroUI的主题系统
3. 覆盖`globals.css`中的全局样式

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 📞 联系方式

- 项目维护者: [NTLx](mailto:lx3325360@gmail.com)
- 项目主页: [https://github.com/NTLx/search.report-yida](https://github.com/NTLx/search.report-yida)

## 🙏 致谢

感谢以下开源项目：
- [Next.js](https://nextjs.org/) - React全栈框架
- [Express.js](https://expressjs.com/) - Node.js Web框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [HeroUI](https://heroui.com/) - React UI组件库
- [Lucide](https://lucide.dev/) - 美观的图标库

---

<div align="center">

如果这个项目对您有帮助，请给我们一个⭐️！

[回到顶部](#report-yida)

</div>