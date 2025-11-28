// 报告查询系统的主要业务逻辑

class ReportQuerySystem {
    constructor() {
        // 初始化DOM元素引用
        this.initializeElements();
        this.initializeThemeToggle();
        // 绑定事件监听器
        this.bindEvents();
        // 初始检查表单有效性
        this.checkFormValidity();
    }

    initializeThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = toggleBtn.querySelector('.material-symbols-outlined');

        // Update icon based on current theme
        const updateIcon = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            icon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
            toggleBtn.setAttribute('aria-label', currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
        };

        // Initial icon state
        updateIcon();

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            updateIcon();

            // Add a subtle rotation animation to icon
            icon.style.transition = 'transform 0.3s ease';
            icon.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        this.form = document.getElementById('query-form');
        this.nameInput = document.getElementById('name');
        this.phoneInput = document.getElementById('phone');
        this.submitButton = document.getElementById('submit-button');
        this.nameError = document.getElementById('name-error');
        this.phoneError = document.getElementById('phone-error');
        this.loading = document.getElementById('loading');
        this.resultsSection = document.getElementById('results-section');
        this.resultsBody = document.getElementById('results-body');
        this.noResults = document.getElementById('no-results');
        this.resultsError = document.getElementById('results-error');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 姓名输入事件
        this.nameInput.addEventListener('input', () => {
            this.validateNameInput();
            this.checkFormValidity();
        });

        // 手机号输入事件
        this.phoneInput.addEventListener('input', () => {
            this.validatePhoneInput();
            this.checkFormValidity();
        });

        // 表单提交事件
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submitQuery();
        });

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * 验证手机号格式
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    validatePhone(phone) {
        return /^1[3-9]\d{9}$/.test(phone);
    }

    /**
     * 验证姓名字段
     * @param {string} name - 姓名
     * @returns {boolean} 是否有效
     */
    validateName(name) {
        return name.trim().length > 0;
    }

    /**
     * 验证姓名输入
     */
    validateNameInput() {
        if (this.validateName(this.nameInput.value)) {
            this.hideError(this.nameInput, this.nameError);
            return true;
        } else {
            this.showError(this.nameInput, this.nameError, '请输入有效的姓名');
            return false;
        }
    }

    /**
     * 验证手机号输入
     */
    validatePhoneInput() {
        // 只允许输入数字
        this.phoneInput.value = this.phoneInput.value.replace(/[^0-9]/g, '');

        if (this.phoneInput.value.length > 0 && !this.validatePhone(this.phoneInput.value)) {
            this.showError(this.phoneInput, this.phoneError, '请输入有效的手机号（11位数字）');
            return false;
        } else {
            this.hideError(this.phoneInput, this.phoneError);
            return true;
        }
    }

    /**
     * 检查表单是否可提交
     */
    checkFormValidity() {
        const isNameValid = this.validateName(this.nameInput.value);
        const isPhoneValid = this.validatePhone(this.phoneInput.value);

        this.submitButton.disabled = !(isNameValid && isPhoneValid);
    }

    /**
     * 显示错误信息
     * @param {HTMLElement} input - 输入元素
     * @param {HTMLElement} errorElement - 错误信息元素
     * @param {string} message - 错误信息
     */
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    /**
     * 隐藏错误信息
     * @param {HTMLElement} input - 输入元素
     * @param {HTMLElement} errorElement - 错误信息元素
     */
    hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.style.display = 'none';
    }

    /**
     * 提交查询请求
     */
    async submitQuery() {
        // 隐藏之前的结果和错误
        this.resultsSection.style.display = 'none';
        this.resultsError.style.display = 'none';

        // 显示加载状态
        this.loading.style.display = 'block';

        try {
            // 构建请求数据
            const requestData = {
                name: this.nameInput.value.trim(),
                phone: this.phoneInput.value.trim()
            };

            // 发送API请求
            const response = await this.queryReports(requestData);

            // 处理响应
            this.handleQueryResponse(response);
        } catch (error) {
            console.error('查询请求失败:', error);
            this.showQueryError('网络错误，请检查网络连接后重试');
        } finally {
            // 隐藏加载状态
            this.loading.style.display = 'none';
        }
    }

    /**
     * 发送报告查询请求到服务器
     * @param {Object} data - 查询数据
     * @returns {Promise<Object>} 查询结果
     */
    async queryReports(data) {
        try {
            const apiBaseUrl = (window.AppConfig && window.AppConfig.apiBaseUrl) || '';
            const response = await fetch(`${apiBaseUrl}/api/query-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * 处理查询响应
     * @param {Object} data - 响应数据
     */
    handleQueryResponse(data) {
        // 显示结果区域
        this.resultsSection.style.display = 'block';

        if (data.success) {
            // 清空结果表格
            this.resultsBody.innerHTML = '';

            if (data.data && data.data.length > 0) {
                // 显示结果表格，隐藏无结果提示
                this.noResults.style.display = 'none';

                // 添加结果到表格
                data.data.forEach((report) => {
                    this.addReportToTable(report);
                });
            } else {
                // 显示无结果提示
                this.noResults.style.display = 'block';
            }
        } else {
            // 显示错误信息
            this.showQueryError(data.message || '查询失败，请稍后重试');
        }
    }

    /**
     * 添加报告到结果表格
     * @param {Object} report - 报告数据
     */
    addReportToTable(report) {
        const row = document.createElement('tr');

        // 文件名单元格
        const nameCell = document.createElement('td');
        nameCell.textContent = report.fileName;
        row.appendChild(nameCell);

        // 创建日期单元格
        const dateCell = document.createElement('td');
        dateCell.textContent = report.createTime || '未知';
        row.appendChild(dateCell);

        // 下载链接单元格
        const linkCell = document.createElement('td');
        if (report.downloadUrl) {
            const link = document.createElement('a');
            link.href = report.downloadUrl;
            link.textContent = '下载';
            link.className = 'download-link';
            link.target = '_blank';
            link.title = `下载 ${report.fileName}`;

            // 添加点击跟踪
            link.addEventListener('click', () => {
                console.log(`用户下载报告: ${report.fileName}`);
            });

            linkCell.appendChild(link);
        } else {
            const errorSpan = document.createElement('span');
            errorSpan.textContent = report.error || '无法下载';
            errorSpan.className = 'download-error';
            linkCell.appendChild(errorSpan);
        }
        row.appendChild(linkCell);

        this.resultsBody.appendChild(row);
    }

    /**
     * 检测是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 确保表格在小屏幕上可以水平滚动
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper && window.innerWidth < 768) {
            tableWrapper.style.overflowX = 'auto';
        }
    }

    /**
     * 显示查询错误
     * @param {string} message - 错误信息
     */
    showQueryError(message) {
        this.resultsError.textContent = message;
        this.resultsError.style.display = 'block';
        this.resultsSection.style.display = 'block';

        // 清空结果表格
        this.resultsBody.innerHTML = '';
        this.noResults.style.display = 'none';
    }
}

// 页面加载完成后初始化系统
document.addEventListener('DOMContentLoaded', () => {
    // 创建并初始化报告查询系统实例
    const reportSystem = new ReportQuerySystem();

    // 将实例暴露到window对象，便于调试
    window.reportSystem = reportSystem;

    console.log('报告查询系统初始化完成');
});