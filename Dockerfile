# 使用官方Node.js镜像作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制应用代码
COPY . .

# 安装依赖
RUN npm install --legacy-peer-deps

# 创建空的 .env 文件以满足启动命令的要求 (环境变量将由Docker注入)
RUN touch .env

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["npm", "start"]