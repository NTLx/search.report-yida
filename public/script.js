// 报告查询系统的主要业务逻辑

class ReportQuerySystem {
    constructor() {
        // 初始化DOM元素引用
        this.initializeElements();
        // 绑定事件监听器
        this.bindEvents();
        // 初始检查表单有效性
        this.checkFormValidity();
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
        
        // 移动设备触摸事件支持
        this.addTouchEventSupport();
        
        // 初始化表单交互
        this.initializeFormInteractions();
        
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
        // 移动设备上添加振动反馈
        if (this.isMobileDevice() && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 隐藏之前的结果和错误
        this.resultsSection.style.display = 'none';
        this.resultsError.style.display = 'none';
        
        // 显示加载状态
        this.loading.style.display = 'block';
        
        // 在移动设备上，确保加载状态可见
        if (this.isMobileDevice()) {
            setTimeout(() => {
                this.loading.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        
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
            const response = await fetch('/api/query-reports', {
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
        
        // 移动设备上确保结果区域可见
        if (this.isMobileDevice()) {
            setTimeout(() => {
                this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        
        if (data.success) {
            // 清空结果表格
            this.resultsBody.innerHTML = '';
            
            if (data.data && data.data.length > 0) {
                // 显示结果表格，隐藏无结果提示
                this.noResults.style.display = 'none';
                
                // 移动设备上减少动画延迟，提高响应速度
                const delay = this.isMobileDevice() ? 50 : 100;
                
                // 添加结果到表格，带延迟动画效果
                data.data.forEach((report, index) => {
                    setTimeout(() => {
                        this.addReportToTable(report);
                    }, index * delay); // 根据设备调整延迟时间
                });
                
                // 添加成功动画效果
                this.resultsSection.classList.add('results-loaded');
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
        nameCell.classList.add('report-name-cell');
        
        // 添加文件名渐变效果
        nameCell.style.background = 'linear-gradient(90deg, #e2e8f0, #cbd5e1)';
        nameCell.style.backgroundClip = 'text';
        nameCell.style.webkitBackgroundClip = 'text';
        nameCell.style.webkitTextFillColor = 'transparent';
        
        row.appendChild(nameCell);
        
        // 创建日期单元格
        const dateCell = document.createElement('td');
        dateCell.textContent = report.createTime || '未知';
        dateCell.classList.add('report-date-cell');
        
        // 移动设备上更紧凑的日期显示
        if (this.isMobileDevice()) {
            dateCell.style.fontSize = '12px';
            dateCell.style.whiteSpace = 'nowrap';
        }
        
        // 日期文字样式
        dateCell.style.color = '#cbd5e1';
        dateCell.style.fontWeight = '500';
        
        row.appendChild(dateCell);
        
        // 下载链接单元格
        const linkCell = document.createElement('td');
        if (report.downloadUrl) {
            const link = document.createElement('a');
            link.href = report.downloadUrl;
            link.textContent = '点击下载';
            link.className = 'download-link cool-mode';
            link.target = '_blank';
            link.title = `下载 ${report.fileName}`;
            
            // 为所有设备添加触摸反馈
            this.addTouchFeedback(link);
            
            // 移除悬停时的图标变化效果
            // 在所有设备上保持一致的显示
            link.innerHTML = '点击下载';
            
            // 添加点击跟踪
            link.addEventListener('click', () => {
                console.log(`用户下载报告: ${report.fileName}`);
                // 移动设备上添加点击振动反馈（如果支持）
                if (this.isMobileDevice() && navigator.vibrate) {
                    navigator.vibrate(50);
                }
            });
            
            linkCell.appendChild(link);
        } else {
            const errorSpan = document.createElement('span');
            errorSpan.textContent = report.error || '无法下载';
            errorSpan.style.color = '#ff4d4f';
            errorSpan.classList.add('download-error');
            linkCell.appendChild(errorSpan);
        }
        row.appendChild(linkCell);
        
        // 优化移动设备上的动画效果
        const animationDuration = this.isMobileDevice() ? '0.4s' : '0.6s';
        
        // 添加动画效果：从左侧滑入并淡入
        row.style.opacity = '0';
        row.style.transform = 'translateX(-50px)';
        row.style.transition = `opacity ${animationDuration} ease-out, transform ${animationDuration} ease-out`;
        
        this.resultsBody.appendChild(row);
        
        // 触发动画
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, 50);
    }
    
    /**
     * 检测是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * 添加触摸事件支持
     */
    addTouchEventSupport() {
        // 为提交按钮添加触摸效果
        this.addTouchFeedback(this.submitButton);
        
        // 优化移动设备上的表单提交 - 修复输入框无法点击的问题
        // 移除了阻止输入框和按钮默认行为的代码，现在用户可以直接点击输入框
        
        // 为表格行添加触摸反馈 - 修复输入框点击问题
        if (this.resultsBody) {
            this.resultsBody.addEventListener('touchstart', (e) => {
                // 确保事件不会影响输入框
                const row = e.target.closest('tr');
                if (row && !e.target.closest('input')) {
                    row.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }
            });
            
            this.resultsBody.addEventListener('touchend', (e) => {
                // 确保事件不会影响输入框
                const row = e.target.closest('tr');
                if (row && !e.target.closest('input')) {
                    setTimeout(() => {
                        row.style.backgroundColor = '';
                    }, 200);
                }
            });
        }
    }
    
    /**
     * 为元素添加触摸反馈
     * @param {HTMLElement} element - 目标元素
     */
    addTouchFeedback(element) {
        if (!element) return;
        
        // 修复触摸屏点击问题 - 确保输入框不会受到影响
        // 只为按钮添加触摸反馈，不影响输入框
        if (element.tagName === 'BUTTON' || element.type === 'submit') {
            element.addEventListener('touchstart', (e) => {
                // 确保不会阻止默认行为
                element.style.transform = 'scale(0.98)';
                element.style.transition = 'transform 0.15s ease';
            });
            
            element.addEventListener('touchend', (e) => {
                element.style.transform = 'scale(1)';
            });
            
            element.addEventListener('touchcancel', (e) => {
                element.style.transform = 'scale(1)';
            });
        }
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
        
        // 移动设备上重置一些动画效果
        if (this.isMobileDevice()) {
            // 简化移动设备上的动画效果
            const rows = this.resultsBody.querySelectorAll('tr');
            rows.forEach(row => {
                row.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            });
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

    /**
     * 重置表单
     */
    resetForm() {
        // 添加重置动画
        this.resultsSection.style.opacity = '0';
        this.resultsSection.style.transform = 'translateY(20px)';
        this.resultsSection.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        setTimeout(() => {
            // 执行重置操作
            this.form.reset();
            this.hideError(this.nameInput, this.nameError);
            this.hideError(this.phoneInput, this.phoneError);
            this.checkFormValidity();
            this.resultsSection.style.display = 'none';
            
            // 重置动画样式
            this.resultsSection.style.opacity = '1';
            this.resultsSection.style.transform = 'translateY(0)';
        }, 300);
        
        // 添加重置按钮或功能可以在这里触发
    }
    
    /**
     * 添加键盘快捷键支持
     */
    addKeyboardShortcuts() {
        // 按Enter键提交表单
        document.addEventListener('keydown', (e) => {
            // 防止在移动设备上过度触发
            if (e.key === 'Enter' && !this.submitButton.disabled && !this.isMobileDevice()) {
                this.submitQuery();
            }
            
            // 按Escape键重置表单
            if (e.key === 'Escape') {
                this.resetForm();
            }
        });
    }
    
    /**
     * 初始化表单验证和交互
     */
    initializeFormInteractions() {
        // 添加表单输入的实时反馈
        const inputs = [this.nameInput, this.phoneInput];
        inputs.forEach(input => {
            // 修复触摸屏点击问题 - 确保输入框可以正常点击
            // 直接设置样式属性，确保它们不会被其他CSS覆盖
            input.style.pointerEvents = 'auto';
            input.style.touchAction = 'manipulation';
            input.style.webkitUserSelect = 'auto';
            input.style.userSelect = 'auto';
            input.style.webkitTapHighlightColor = 'transparent';
            input.style.zIndex = '10';
            
            // 优化移动设备上的输入体验
            input.addEventListener('focus', () => {
                // 在移动设备上滚动到输入框位置
                if (this.isMobileDevice()) {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            });
            
            // 修复触摸屏点击问题 - 确保输入框可以正常点击
            input.addEventListener('touchstart', (e) => {
                // 不阻止默认行为，确保输入框可以获得焦点
                console.log('输入框触摸事件触发');
                // 确保输入框可以获得焦点
                setTimeout(() => {
                    input.focus();
                }, 0);
            }, { passive: true });
            
            input.addEventListener('touchend', (e) => {
                // 不阻止默认行为，确保输入框可以获得焦点
                console.log('输入框触摸结束事件触发');
                // 确保输入框可以获得焦点
                setTimeout(() => {
                    input.focus();
                }, 0);
            }, { passive: true });
            
            // 添加点击事件作为备用
            input.addEventListener('click', (e) => {
                console.log('输入框点击事件触发');
                input.focus();
            });
        });
        
        // 添加键盘快捷键
        this.addKeyboardShortcuts();
    }
}

// 页面加载完成后初始化系统
        document.addEventListener('DOMContentLoaded', () => {
            // 添加页面加载动画
            document.body.classList.add('page-loaded');
            
            // 创建并初始化报告查询系统实例
            const reportSystem = new ReportQuerySystem();
            
            // 修复触摸屏点击问题 - 确保输入框可以正常点击
            // 在页面加载完成后再次设置输入框样式
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            
            if (nameInput) {
                nameInput.style.pointerEvents = 'auto';
                nameInput.style.touchAction = 'manipulation';
                nameInput.style.zIndex = '10';
                nameInput.style.position = 'relative';
            }
            
            if (phoneInput) {
                phoneInput.style.pointerEvents = 'auto';
                phoneInput.style.touchAction = 'manipulation';
                phoneInput.style.zIndex = '10';
                phoneInput.style.position = 'relative';
            }
            
            // 将实例暴露到window对象，便于调试
            window.reportSystem = reportSystem;
            
            console.log('报告查询系统初始化完成');
        });
        
        // 添加平滑滚动效果 - 修复输入框点击问题
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                // 确保只处理实际的锚点链接，不影响其他元素
                if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        
        // 输入框动画效果已完全禁用以解决触摸屏设备上的交互问题
        // 标签将保持在原始位置，不会移动或缩放