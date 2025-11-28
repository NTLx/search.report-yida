/**
 * 前端配置文件
 * 
 * 用于配置API基础URL等环境相关参数。
 * 在GitHub Pages等静态托管环境部署时，需要修改 apiBaseUrl 指向实际的后端服务地址。
 */
window.AppConfig = {
    // API基础URL
    // 本地开发和Vercel部署（同源）时保持为空字符串
    // GitHub Pages部署时填写后端服务完整URL，例如: 'https://your-app.vercel.app'
    apiBaseUrl: ''
};
