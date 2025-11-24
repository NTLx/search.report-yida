# 贡献指南

感谢您对Report-YiDa项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 提交Bug报告
- 提出新功能建议
- 提交代码改进
- 完善文档

## 🚀 开始贡献

### 环境准备

1. **Fork并克隆仓库**
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
   # 编辑.env文件，填入您的测试环境配置
   ```

4. **启动开发服务器**
   ```bash
   npm start
   ```

### 开发流程

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或者
   git checkout -b fix/your-bug-fix
   ```

2. **进行开发**
   - 遵循现有代码风格
   - 添加必要的注释
   - 确保代码可读性

3. **测试您的更改**
   - 确保所有功能正常工作
   - 测试边界情况
   - 检查是否有内存泄漏

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

5. **推送并创建PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 提交信息规范

我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范：

- `feat:` 新功能
- `fix:` 修复Bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `test:` 添加测试
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加报告批量下载功能

- 实现多选报告功能
- 添加打包下载API
- 更新前端UI支持批量操作
```

## 🐛 报告Bug

在提交Bug报告前，请确保：

1. 检查是否已有相关Issue：https://github.com/NTLx/search.report-yida/issues
2. 确保Bug在最新版本中仍然存在
3. 提供详细的重现步骤

Bug报告模板：
```markdown
**Bug描述**
简要描述Bug

**重现步骤**
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**预期行为**
描述您期望发生的情况

**实际行为**
描述实际发生的情况

**截图**
如果适用，添加截图来帮助解释问题

**环境信息**
- 操作系统: [例如 iOS]
- 浏览器: [例如 chrome, safari]
- 版本: [例如 22]

**附加信息**
添加任何其他关于问题的信息
```

## 💡 功能请求

在提交功能请求前，请考虑：

1. 这个功能是否符合项目目标？
2. 是否已有类似功能？
3. 这个功能的实现复杂度如何？

功能请求模板：
```markdown
**功能描述**
简要描述您希望添加的功能

**问题背景**
描述这个功能要解决的问题

**解决方案**
描述您期望的解决方案

**替代方案**
描述您考虑过的其他解决方案

**附加信息**
添加任何其他关于功能请求的信息
```

## 🎨 代码风格指南

### JavaScript/Node.js

- 使用2个空格缩进
- 使用单引号
- 每行最大长度100字符
- 使用ES6+语法
- 函数和变量使用驼峰命名法

### 注释规范

- 复杂逻辑必须添加注释
- 函数应有JSDoc注释
- API端点应有详细说明

示例：
```javascript
/**
 * 查询报告数据
 * @param {Object} queryParams - 查询参数
 * @param {string} queryParams.searchType - 搜索类型
 * @param {string} queryParams.searchValue - 搜索值
 * @param {number} queryParams.pageSize - 页面大小
 * @param {number} queryParams.currentPage - 当前页码
 * @returns {Promise<Object>} 查询结果
 */
async function queryReportData(queryParams) {
  // 实现逻辑...
}
```

## 🔍 代码审查

所有代码贡献都需要经过代码审查。审查者将检查：

1. 代码质量和风格
2. 功能实现是否正确
3. 是否有潜在的安全问题
4. 测试覆盖率
5. 文档是否更新

## 📚 文档贡献

文档也是项目的重要组成部分！您可以：

- 修复文档中的错误
- 添加使用示例
- 翻译文档
- 改进文档结构

## 👨‍💻 项目维护者

本项目由以下人员维护：

- **NTLx** (lx3325360@gmail.com) - 项目创建者和主要维护者

## 🤝 社区准则

- 尊重所有参与者
- 保持友好和专业
- 接受建设性的批评
- 关注对社区最有利的事情

## 📞 联系方式

如有任何问题，您可以通过以下方式联系我们：

- 创建GitHub Issue：https://github.com/NTLx/search.report-yida/issues/new
- 发送邮件至：lx3325360@gmail.com

感谢您的贡献！🎉