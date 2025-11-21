# 使用官方Node.js镜像作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，因为需要构建前端）
RUN npm install --legacy-peer-deps

# 复制应用代码
COPY . .

# 构建Next.js应用
RUN npm run build

# 暴露端口
EXPOSE 3000
EXPOSE 3001

# 启动命令 - 同时启动后端和前端服务
CMD sh -c "node server.js & npm start"