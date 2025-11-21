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

# 创建启动脚本
RUN echo '#!/bin/sh\n# 启动后端服务器\nnode server.js &\n# 启动前端服务器\nnpm start' > /app/start.sh && \
    chmod +x /app/start.sh

# 暴露端口
EXPOSE 3000
EXPOSE 3001

# 启动命令
CMD ["/app/start.sh"]